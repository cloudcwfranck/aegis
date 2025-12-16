# SBOM Processing

Software Bill of Materials (SBOM) processing is a core capability of Aegis, enabling comprehensive vulnerability tracking and compliance reporting.

## What is an SBOM?

A **Software Bill of Materials** (SBOM) is a comprehensive inventory of all software components, libraries, and dependencies in an application or container image.

SBOMs provide:

- **Transparency**: Complete visibility into third-party code
- **Security**: Enables vulnerability tracking across dependencies
- **Compliance**: Required by Executive Order 14028 and FedRAMP
- **License Management**: Track open-source licenses

## Supported Formats

Aegis supports industry-standard SBOM formats:

### SPDX 2.3 (Recommended)

The **Software Package Data Exchange** (SPDX) format is an ISO/IEC standard:

```json
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "aegis-api",
  "documentNamespace": "https://aegis.dev/sbom/aegis-api-v0.1.0",
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-express",
      "name": "express",
      "versionInfo": "4.18.2",
      "supplier": "Organization: OpenJS Foundation",
      "downloadLocation": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "filesAnalyzed": false,
      "licenseConcluded": "MIT",
      "externalRefs": [
        {
          "referenceCategory": "PACKAGE-MANAGER",
          "referenceType": "purl",
          "referenceLocator": "pkg:npm/express@4.18.2"
        }
      ]
    }
  ],
  "relationships": [
    {
      "spdxElementId": "SPDXRef-DOCUMENT",
      "relationshipType": "DESCRIBES",
      "relatedSpdxElement": "SPDXRef-Package-express"
    }
  ]
}
```

### CycloneDX 1.4

The **CycloneDX** format is lightweight and purpose-built for security:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "serialNumber": "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
  "version": 1,
  "metadata": {
    "timestamp": "2025-12-16T15:30:00Z",
    "component": {
      "type": "application",
      "name": "aegis-api",
      "version": "0.1.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "purl": "pkg:npm/express@4.18.2",
      "licenses": [{ "license": { "id": "MIT" } }]
    }
  ]
}
```

### Syft JSON

Aegis also accepts Syft's native JSON format:

```bash
syft . -o json > sbom.syft.json
```

## SBOM Parsing Workflow

```
Upload SBOM
     │
     ▼
┌──────────────────┐
│ Detect Format    │
│ - SPDX 2.3       │
│ - CycloneDX 1.4  │
│ - Syft JSON      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Extract          │
│ Components       │
│ - Name           │
│ - Version        │
│ - PURL           │
│ - License        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Normalize        │
│ - Resolve deps   │
│ - Deduplicate    │
│ - Generate IDs   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Store in DB      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Queue Vuln Scan  │
└──────────────────┘
```

## Component Entity

Extracted components are stored in the database:

```typescript
@Entity()
export class Component {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  evidenceId: string;

  @Column()
  name: string;

  @Column()
  version: string;

  @Column({ nullable: true })
  purl: string; // Package URL (e.g., pkg:npm/express@4.18.2)

  @Column({ nullable: true })
  license: string;

  @Column({ nullable: true })
  supplier: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Vulnerability, (vuln) => vuln.component)
  vulnerabilities: Vulnerability[];
}
```

## Package URL (PURL)

Aegis uses **Package URLs (PURLs)** to uniquely identify components:

```
pkg:npm/express@4.18.2
pkg:pypi/django@4.2.7
pkg:maven/org.springframework/spring-core@6.1.0
pkg:docker/alpine@3.18
pkg:golang/github.com/gin-gonic/gin@v1.9.1
```

PURLs enable:

- Universal component identification
- Cross-ecosystem vulnerability matching
- Dependency graph construction

## SBOM Parser Worker

The SBOM Parser Worker processes uploaded files:

```typescript
export class SBOMParserWorker {
  async process(job: Job<SBOMParseJob>) {
    const { evidenceId, blobUrl, format } = job.data;

    // 1. Download SBOM from blob storage
    const sbomContent = await this.downloadBlob(blobUrl);

    // 2. Detect format if not specified
    const detectedFormat = format || this.detectFormat(sbomContent);

    // 3. Parse based on format
    let components: Component[];
    switch (detectedFormat) {
      case 'spdx-2.3':
        components = await this.parseSPDX(sbomContent);
        break;
      case 'cyclonedx-1.4':
        components = await this.parseCycloneDX(sbomContent);
        break;
      case 'syft-json':
        components = await this.parseSyft(sbomContent);
        break;
      default:
        throw new Error(`Unsupported format: ${detectedFormat}`);
    }

    // 4. Normalize and deduplicate
    const normalized = this.normalizeComponents(components);

    // 5. Store in database
    await this.storeComponents(evidenceId, normalized);

    // 6. Queue vulnerability scanning
    await this.queueVulnerabilityScan(evidenceId, normalized);

    return { componentsProcessed: normalized.length };
  }
}
```

## Generating SBOMs

### Using Syft

Syft generates SBOMs for containers and filesystems:

```bash
# Generate SPDX SBOM for container image
syft aegis-api:latest -o spdx-json > sbom.spdx.json

# Generate CycloneDX SBOM
syft aegis-api:latest -o cyclonedx-json > sbom.cyclonedx.json

# Scan local directory
syft dir:. -o spdx-json > sbom.spdx.json
```

### Using Trivy

Trivy can also generate SBOMs:

```bash
# Generate SPDX SBOM
trivy image --format spdx-json -o sbom.spdx.json aegis-api:latest

# Generate CycloneDX SBOM
trivy image --format cyclonedx -o sbom.cyclonedx.json aegis-api:latest
```

### Using NPM

For Node.js projects:

```bash
# Install SBOM generator
npm install -g @cyclonedx/cyclonedx-npm

# Generate CycloneDX SBOM
cyclonedx-npm --output-file sbom.cyclonedx.json
```

### Using Maven

For Java projects:

```xml
<!-- Add to pom.xml -->
<plugin>
  <groupId>org.cyclonedx</groupId>
  <artifactId>cyclonedx-maven-plugin</artifactId>
  <version>2.7.9</version>
  <executions>
    <execution>
      <phase>package</phase>
      <goals>
        <goal>makeAggregateBom</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

```bash
mvn package
# SBOM generated at target/bom.json
```

## SBOM Quality

Aegis evaluates SBOM quality based on:

- **Completeness**: All components documented
- **Accuracy**: Correct versions and licenses
- **Depth**: Transitive dependencies included
- **Freshness**: SBOM timestamp vs. build time
- **Format Compliance**: Valid SPDX/CycloneDX schema

Quality score displayed in dashboard:

```
SBOM Quality: ████████░░ 80%

✅ All components have versions
✅ PURLs present for 95% of components
⚠️  Missing licenses for 5% of components
✅ Transitive dependencies included
✅ SBOM timestamp within 24 hours of build
```

## SBOM Comparison

Compare SBOMs across builds to track changes:

```graphql
query CompareSBOMs($evidenceId1: ID!, $evidenceId2: ID!) {
  compareSBOMs(evidenceId1: $evidenceId1, evidenceId2: $evidenceId2) {
    added {
      name
      version
    }
    removed {
      name
      version
    }
    updated {
      name
      oldVersion
      newVersion
    }
  }
}
```

Example output:

```
Components Added (3):
  + express@4.19.0
  + @types/node@20.10.0
  + zod@3.22.4

Components Removed (1):
  - lodash@4.17.20

Components Updated (2):
  ~ typescript: 5.2.2 → 5.3.3
  ~ react: 18.2.0 → 18.3.1
```

## Best Practices

### 1. Generate SBOMs Automatically

Integrate SBOM generation into CI/CD:

```yaml
- name: Generate SBOM
  run: syft . -o spdx-json > sbom.spdx.json

- name: Upload to Aegis
  run: |
    curl -X POST $AEGIS_API_URL/api/evidence \
      -F "file=@sbom.spdx.json" \
      -F "projectId=$PROJECT_ID"
```

### 2. Version SBOMs with Builds

Tag SBOMs with build numbers:

```json
{
  "name": "aegis-api-build-1234",
  "metadata": {
    "buildId": "1234",
    "commit": "abc123",
    "timestamp": "2025-12-16T15:30:00Z"
  }
}
```

### 3. Include Transitive Dependencies

Ensure all dependencies (direct and transitive) are captured:

```bash
# Syft includes transitive deps by default
syft . -o spdx-json

# NPM - include dev dependencies
npm ls --all --json > deps.json
```

### 4. Update SBOMs Regularly

Regenerate SBOMs:

- On every production build
- After dependency updates
- Monthly for long-running services

## Next Steps

- **[Vulnerability Scanning](vulnerabilities.md)** - Learn how components are scanned
- **[Evidence Ingestion](evidence.md)** - Understand evidence upload
- **[Upload Evidence Guide](../guides/upload-evidence.md)** - Step-by-step upload instructions

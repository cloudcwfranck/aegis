# Documentation Feedback Tracking

This directory tracks user feedback on Aegis documentation.

## How Feedback Works

### User Experience

1. **On each documentation page**, users see "Was this page helpful?" with 👍 and 👎 buttons
2. **When clicking 👍**: Shows appreciation message
3. **When clicking 👎**: Shows message with link to open GitHub issue
4. **GitHub issue link** pre-fills:
   - Page title
   - Page URL
   - "Needs Improvement" label
   - Documentation and feedback labels

### Tracking Feedback

All feedback is tracked via GitHub Issues with the `feedback` and `documentation` labels.

**View all feedback**:

```
https://github.com/cloudcwfranck/aegis/issues?q=is%3Aissue+label%3Afeedback+label%3Adocumentation
```

### Feedback Metrics

To track feedback metrics:

```bash
# Count helpful feedback (👍)
# Users who found pages helpful don't file issues, so track via analytics

# Count improvement requests (👎)
gh issue list --label feedback --label documentation --state all --json number,title,createdAt

# Get feedback summary
gh issue list --label feedback --label documentation --state all | wc -l
```

### GitHub Labels

- `documentation` - All documentation-related issues
- `feedback` - User feedback from docs
- `enhancement` - Suggested improvements
- `bug` - Documentation errors or broken links

### Responding to Feedback

1. **Acknowledge**: Comment on issue within 24-48 hours
2. **Assess**: Determine if feedback requires doc updates
3. **Action**: Update documentation as needed
4. **Close**: Close issue once addressed with reference to commit/PR

## Analytics Integration

For more detailed feedback analytics, consider integrating:

- **Google Analytics**: Track page views and feedback clicks
- **Custom Solution**: Build feedback tracking service
- **Plausible Analytics**: Privacy-friendly analytics

## Example Queries

### Most Requested Improvements

```bash
gh issue list \
  --label feedback \
  --label documentation \
  --sort comments \
  --limit 10
```

### Recent Feedback

```bash
gh issue list \
  --label feedback \
  --label documentation \
  --state open \
  --sort created \
  --limit 20
```

### Closed Feedback (Resolved)

```bash
gh issue list \
  --label feedback \
  --label documentation \
  --state closed \
  --limit 20
```

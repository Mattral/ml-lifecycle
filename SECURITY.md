# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to the project maintainers
3. Include a description of the vulnerability, steps to reproduce, and potential impact
4. You should receive a response within 48 hours

## Security Measures

This project implements the following security practices:

### Application Security
- Content Security Policy (CSP) headers
- X-Frame-Options, X-Content-Type-Options, HSTS headers
- No sensitive data stored client-side (simulation only)

### Container Security
- Multi-stage Docker builds (minimal production image)
- Non-root container execution (UID 101)
- Read-only root filesystem
- All capabilities dropped
- No privilege escalation allowed

### Kubernetes Security
- Pod security contexts enforced
- Network policies restricting traffic
- Resource limits preventing DoS
- Service account token automounting disabled
- Rolling updates with zero downtime

### CI/CD Security
- Automated dependency vulnerability scanning (npm audit)
- Container image scanning with Trivy
- Static analysis with CodeQL
- Dependency review on pull requests
- Kubernetes manifest validation with kubeconform
- Weekly scheduled security scans

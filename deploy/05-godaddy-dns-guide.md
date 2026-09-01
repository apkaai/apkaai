# GoDaddy DNS Configuration Guide — apkaai.com

This guide walks you through pointing **apkaai.com** (registered on GoDaddy)
to your AWS EC2 instance and CloudFront CDN.

---

## Prerequisites

Before changing DNS, make sure you have:

- [ ] EC2 instance running in `ap-south-1` (Mumbai)
- [ ] An **Elastic IP** attached to your EC2 (so the IP never changes)
- [ ] CloudFront distribution deployed (from `04-s3-cloudfront.sh`)
- [ ] Nginx running on EC2 (from `02-nginx.sh`)

---

## Step 1 — Get Your EC2 Elastic IP

If you haven't assigned an Elastic IP yet, do it now:

```bash
# Allocate an Elastic IP
aws ec2 allocate-address --domain vpc --region ap-south-1

# Note the AllocationId from the output, then associate it:
aws ec2 associate-address \
  --instance-id YOUR_INSTANCE_ID \
  --allocation-id YOUR_ALLOCATION_ID \
  --region ap-south-1
```

Your Elastic IP will look like: **`13.235.xx.xx`**
Write it down — you'll need it below.

---

## Step 2 — Log Into GoDaddy

1. Go to [https://dcc.godaddy.com](https://dcc.godaddy.com)
2. Click **apkaai.com** → **DNS** tab
3. You'll see the DNS records table

---

## Step 3 — Add / Update DNS Records

Delete any existing `A` records for `@` and `www`, then add these:

### Required Records

| Type  | Name  | Value                          | TTL  | Purpose                        |
|-------|-------|-------------------------------|------|--------------------------------|
| A     | `@`   | `YOUR_EC2_ELASTIC_IP`         | 600  | Root domain → EC2              |
| A     | `www` | `YOUR_EC2_ELASTIC_IP`         | 600  | www → EC2                      |
| CNAME | `cdn` | `YOUR_CLOUDFRONT_DOMAIN.cloudfront.net` | 3600 | CDN subdomain (optional)  |

### How to add an A record in GoDaddy

1. Click **Add New Record**
2. Type: **A**
3. Name: **@** (for root domain) or **www**
4. Value: paste your **EC2 Elastic IP**
5. TTL: **600** (10 minutes — change to 3600 after confirming it works)
6. Click **Save**

Repeat for `www`.

---

## Step 4 — (Optional) Use Route 53 for Better Control

For production, AWS Route 53 gives you health checks, failover, and
latency-based routing. To switch from GoDaddy DNS to Route 53:

### 4a — Create a Hosted Zone in Route 53

```bash
aws route53 create-hosted-zone \
  --name apkaai.com \
  --caller-reference "apkaai-$(date +%s)" \
  --region us-east-1
```

Note the 4 nameservers in the output — they look like:
```
ns-123.awsdns-45.com
ns-456.awsdns-78.net
ns-789.awsdns-01.co.uk
ns-012.awsdns-34.org
```

### 4b — Add DNS records in Route 53

```bash
# Replace values below with your actual IPs and hosted zone ID
ZONE_ID="YOUR_HOSTED_ZONE_ID"
EC2_IP="YOUR_EC2_ELASTIC_IP"

aws route53 change-resource-record-sets \
  --hosted-zone-id "$ZONE_ID" \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "apkaai.com",
          "Type": "A",
          "TTL": 300,
          "ResourceRecords": [{ "Value": "'"$EC2_IP"'" }]
        }
      },
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "www.apkaai.com",
          "Type": "A",
          "TTL": 300,
          "ResourceRecords": [{ "Value": "'"$EC2_IP"'" }]
        }
      }
    ]
  }'
```

### 4c — Update nameservers on GoDaddy

1. GoDaddy → **apkaai.com** → **Nameservers** tab
2. Click **Change** → **Enter my own nameservers**
3. Paste the 4 Route 53 nameservers from Step 4a
4. Save and confirm

> ⚠️ Nameserver propagation takes **24–48 hours** globally.
> GoDaddy's own DNS changes take **30 minutes to 1 hour**.

---

## Step 5 — Verify DNS Propagation

Check from your terminal:

```bash
# Check A record
nslookup apkaai.com 8.8.8.8

# Or with dig
dig apkaai.com +short

# Should return your EC2 Elastic IP
```

Online checker: [https://dnschecker.org/#A/apkaai.com](https://dnschecker.org/#A/apkaai.com)

---

## Step 6 — SSL Certificate

Once DNS is pointing to your EC2, run the SSL script:

```bash
bash 03-ssl.sh
```

This gets a free Let's Encrypt certificate for `apkaai.com` and `www.apkaai.com`
and configures Nginx to serve HTTPS automatically.

---

## Full DNS Record Reference

| Type  | Name     | Value                                   | TTL   | Notes                     |
|-------|----------|-----------------------------------------|-------|---------------------------|
| A     | `@`      | `EC2 Elastic IP`                        | 600   | Root domain               |
| A     | `www`    | `EC2 Elastic IP`                        | 600   | www redirect              |
| CNAME | `cdn`    | `xxxx.cloudfront.net`                   | 3600  | Static assets CDN         |
| CNAME | `api`    | `EC2 Elastic IP` (or use A record)      | 600   | API subdomain (optional)  |
| MX    | `@`      | GoDaddy default or your email provider  | 3600  | Email (keep existing)     |
| TXT   | `@`      | `v=spf1 include:secureserver.net -all`  | 3600  | SPF for email (keep)      |

---

## Architecture After DNS Setup

```
User Browser
     │
     ▼
apkaai.com (GoDaddy / Route 53 DNS)
     │
     ├── A record → EC2 Elastic IP (ap-south-1)
     │                    │
     │              Nginx (port 443)
     │              ├── /api/* → Node.js API (port 4000)
     │              └── /*     → Next.js (port 3000)
     │
     └── cdn.apkaai.com → CloudFront CDN
                              │
                         S3 Bucket (apkaai-assets)
                         └── /images, /logos, /thumbnails
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Site not loading | Check EC2 security group has port 80 and 443 open |
| SSL error | Ensure DNS points to EC2 before running `03-ssl.sh` |
| www not working | Add separate A record for `www` (not a CNAME of `@`) |
| API returning 502 | Check PM2: `pm2 status` and `pm2 logs apkaai-api` |
| Slow DNS | Lower TTL to 300 before making changes, raise back after |

### Open EC2 Security Group Ports

Run this once to allow web traffic:

```bash
# Replace sg-xxxxxxxx with your EC2 security group ID
SG_ID="sg-xxxxxxxx"

aws ec2 authorize-security-group-ingress --group-id "$SG_ID" \
  --protocol tcp --port 80  --cidr 0.0.0.0/0 --region ap-south-1

aws ec2 authorize-security-group-ingress --group-id "$SG_ID" \
  --protocol tcp --port 443 --cidr 0.0.0.0/0 --region ap-south-1
```

---

*Last updated: 2026 — apkaai.com DNS Guide*

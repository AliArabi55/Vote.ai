# 🚀 Azure Infrastructure Setup Guide
## Ambassador Voice Platform - Complete DevOps Setup

This guide will walk you through setting up all required Azure resources for the Vote.ai platform.

---

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ An active **Azure subscription** ([Create a free account](https://azure.microsoft.com/free/))
- ✅ Access to the **Azure Portal** (https://portal.azure.com)
- ✅ Your **local machine's public IP address** (visit https://whatismyipaddress.com)

---

## 🗂️ Part 1: Create a Resource Group

A Resource Group is a container that holds related Azure resources.

### Steps:

1. **Sign in to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Sign in with your Microsoft account

2. **Create Resource Group**
   - Click **"Create a resource"** (top-left corner)
   - Search for **"Resource Group"**
   - Click **"Create"**

3. **Configure Resource Group**
   - **Subscription**: Select your subscription
   - **Resource group name**: `vote-ai-resources` (or your preferred name)
   - **Region**: Choose closest to you (e.g., `East US`, `West Europe`, `Southeast Asia`)
   - Click **"Review + create"**
   - Click **"Create"**

✅ **Result**: You now have a resource group to organize all your resources.

---

## 🐘 Part 2: Create Azure Database for PostgreSQL - Flexible Server

### Step 2.1: Create the Database Server

1. **Navigate to Create Resource**
   - Click **"Create a resource"**
   - Search for **"Azure Database for PostgreSQL"**
   - Select **"Azure Database for PostgreSQL Flexible Server"**
   - Click **"Create"**

2. **Configure Basic Settings**
   - **Subscription**: Your subscription
   - **Resource group**: Select `vote-ai-resources` (created earlier)
   - **Server name**: `vote-ai-db-server` (must be globally unique, add your initials if needed)
   - **Region**: Same as your resource group
   - **PostgreSQL version**: `16` (latest stable)
   - **Workload type**: Select **"Development"** (cheaper for testing)

3. **Configure Administrator Account**
   - **Admin username**: `voteadmin` (remember this!)
   - **Password**: Create a strong password (minimum 8 characters, mix of upper/lower/numbers/symbols)
   - **Confirm password**: Re-enter your password
   
   ⚠️ **IMPORTANT**: Write down these credentials! You'll need them for your `.env` file.

4. **Configure Compute + Storage**
   - Click **"Configure server"**
   - **Compute tier**: Select **"Burstable"** (B1ms - cheapest option)
   - **Storage**: `32 GiB` (minimum)
   - **Backup retention**: `7 days`
   - Click **"Save"**

5. **Configure Networking**
   - Click **"Next: Networking"**
   - **Connectivity method**: Select **"Public access (allowed IP addresses)"**
   - Under **Firewall rules**, click **"+ Add current client IP address"**
   - This will add your current IP (e.g., `203.0.113.45`)
   
   📝 **Note**: You can also manually add IP ranges:
   - **Rule name**: `MyLocalMachine`
   - **Start IP**: Your public IP (from https://whatismyipaddress.com)
   - **End IP**: Same as Start IP
   
   - ✅ Check **"Allow public access from any Azure service within Azure to this server"** (for future Azure deployments)

6. **Review and Create**
   - Click **"Review + create"**
   - Review your configuration
   - Click **"Create"**
   - ⏱️ **Wait 5-10 minutes** for deployment to complete

### Step 2.2: Enable pgvector Extension

1. **Navigate to Your Database Server**
   - Go to **"All resources"**
   - Click on your database server `vote-ai-db-server`

2. **Enable Extensions**
   - In the left menu, under **Settings**, click **"Server parameters"**
   - In the search box, type: `azure.extensions`
   - Find the parameter **`azure.extensions`**
   - Click **"Edit"** (pencil icon)
   - In the dropdown, select **`VECTOR`** (scroll down to find it)
   - Click **"Save"** at the top
   - ⏱️ Wait 1-2 minutes for the server to restart

### Step 2.3: Get Connection String

1. **Get Connection Details**
   - Still in your database server page
   - In the left menu, click **"Overview"**
   - Note down these values:

   ```
   Server name: vote-ai-db-server.postgres.database.azure.com
   Admin username: voteadmin
   Password: [your password from step 2.1]
   Database name: postgres (default)
   Port: 5432
   ```

2. **Build Your Connection String**
   
   Format:
   ```
   postgresql://USERNAME:PASSWORD@SERVER_NAME.postgres.database.azure.com:5432/postgres?sslmode=require
   ```

   Example:
   ```
   postgresql://voteadmin:MyStr0ngP@ss!@vote-ai-db-server.postgres.database.azure.com:5432/postgres?sslmode=require
   ```

   ⚠️ **IMPORTANT**: 
   - Replace `USERNAME` with your admin username
   - Replace `PASSWORD` with your password (URL-encode special characters if needed)
   - Replace `SERVER_NAME` with your actual server name
   - Keep `?sslmode=require` at the end (Azure requires SSL)

3. **Save to .env File**
   
   Add this to `backend/.env`:
   ```ini
   DATABASE_URL=postgresql://voteadmin:YourPassword@vote-ai-db-server.postgres.database.azure.com:5432/postgres?sslmode=require
   ```

### Step 2.4: Test Connection (Optional)

If you have `psql` installed locally:

```powershell
psql "postgresql://voteadmin:YourPassword@vote-ai-db-server.postgres.database.azure.com:5432/postgres?sslmode=require"
```

If successful, you'll see:
```
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

postgres=>
```

Type `\q` to exit.

---

## 🤖 Part 3: Create Azure OpenAI Resource

### Step 3.1: Create Azure OpenAI Service

1. **Navigate to Create Resource**
   - Click **"Create a resource"**
   - Search for **"Azure OpenAI"**
   - Click **"Create"**

2. **Configure Basic Settings**
   - **Subscription**: Your subscription
   - **Resource group**: Select `vote-ai-resources`
   - **Region**: Select a region that supports Azure OpenAI:
     - ✅ **East US** (recommended)
     - ✅ **East US 2**
     - ✅ **West Europe**
     - ✅ **Sweden Central**
     - ⚠️ Not all regions support all models - East US is safest choice
   - **Name**: `vote-ai-openai` (must be globally unique)
   - **Pricing tier**: Select **"Standard S0"**

3. **Configure Network**
   - Click **"Next: Network"**
   - **Network security**: Select **"All networks, including the internet, can access this resource"**
   - (For production, you'd restrict this, but for development this is fine)

4. **Review and Create**
   - Click **"Next: Tags"** (skip tags for now)
   - Click **"Next: Review + submit"**
   - Click **"Create"**
   - ⏱️ **Wait 2-3 minutes** for deployment

### Step 3.2: Deploy the text-embedding-3-small Model

1. **Navigate to Azure OpenAI Studio**
   - After deployment completes, click **"Go to resource"**
   - Click the button **"Go to Azure OpenAI Studio"** (or visit https://oai.azure.com/)
   - Sign in if prompted

2. **Deploy Embedding Model**
   - In Azure OpenAI Studio, click **"Deployments"** in the left menu
   - Click **"+ Create new deployment"**
   
   Configure:
   - **Select a model**: Choose **"text-embedding-3-small"**
   - **Model version**: Select **"1"** (or latest available)
   - **Deployment name**: `text-embedding-3-small` (use this exact name - your code expects it)
   - **Deployment type**: **"Standard"**
   - **Tokens per Minute Rate Limit**: `120K` (default is fine)
   - Click **"Create"**

   ✅ Model deployed successfully!

### Step 3.3: Deploy the gpt-4o-mini Model (Optional - for future features)

1. **Create Second Deployment**
   - Still in **"Deployments"**
   - Click **"+ Create new deployment"** again
   
   Configure:
   - **Select a model**: Choose **"gpt-4o-mini"**
   - **Model version**: Select **"2024-07-18"** (or latest)
   - **Deployment name**: `gpt-4o-mini`
   - **Tokens per Minute Rate Limit**: `150K`
   - Click **"Create"**

   ✅ Both models are now deployed!

### Step 3.4: Get API Keys and Endpoint

1. **Get Endpoint URL**
   - Go back to the **Azure Portal** (portal.azure.com)
   - Navigate to **"All resources"**
   - Click on your OpenAI resource: `vote-ai-openai`
   - In the left menu, click **"Keys and Endpoint"**
   
   You'll see:
   - **Endpoint**: `https://vote-ai-openai.openai.azure.com/`
   - **Key 1**: `abc123def456...` (long string)
   - **Key 2**: `xyz789uvw012...` (backup key)

2. **Copy the Values**
   - **Endpoint**: Copy the full URL (ends with `.openai.azure.com/`)
   - **Key 1**: Click **"Show Key"** → Click **"Copy"** icon
   
   ⚠️ **IMPORTANT**: Keep these secret! Don't commit to Git.

3. **Add to .env File**
   
   Add these lines to `backend/.env`:
   ```ini
   AZURE_OPENAI_API_KEY=your-key-1-here
   AZURE_OPENAI_ENDPOINT=https://vote-ai-openai.openai.azure.com/
   AZURE_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
   AZURE_OPENAI_CHAT_MODEL=gpt-4o-mini
   ```

### Step 3.5: Verify Deployment in Azure OpenAI Studio

1. **Test the Embedding Model**
   - Go to **Azure OpenAI Studio** (https://oai.azure.com/)
   - Click **"Deployments"**
   - You should see both models listed:
     - ✅ `text-embedding-3-small` - **Status: Succeeded**
     - ✅ `gpt-4o-mini` - **Status: Succeeded**

2. **Optional: Test in Playground**
   - Click **"Chat"** in left menu
   - Select deployment: `gpt-4o-mini`
   - Type: "Hello, are you working?"
   - Click **Send**
   - If you get a response, everything is working! ✅

---

## 🔐 Part 4: Final .env Configuration

### Complete .env File Template

Create/update `backend/.env` with all values:

```ini
# Database Configuration
DATABASE_URL=postgresql://voteadmin:YourPassword@vote-ai-db-server.postgres.database.azure.com:5432/postgres?sslmode=require

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=abc123def456xyz789uvw012...
AZURE_OPENAI_ENDPOINT=https://vote-ai-openai.openai.azure.com/
AZURE_OPENAI_EMBEDDING_MODEL=text-embedding-3-small
AZURE_OPENAI_CHAT_MODEL=gpt-4o-mini

# JWT Secret (generate a random secret)
SECRET_KEY=your-random-secret-key-here

# Environment
ENVIRONMENT=development
```

### Generate SECRET_KEY

Run this command in PowerShell to generate a secure random key:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Example output:
```
k7mN9pQ2rT5vX8zA3bC6dF1gH4jL0mP9sU2wY5eR8tI1oK4nM7qS0vZ3xA6cE9fH
```

Copy this value and paste it as your `SECRET_KEY`.

---

## 📊 Cost Estimation

Here's what you'll pay approximately (as of November 2024):

| Resource | Configuration | Estimated Monthly Cost |
|----------|--------------|----------------------|
| PostgreSQL Flexible Server | B1ms (Burstable, 1 vCore, 2GB RAM, 32GB storage) | ~$12 USD |
| Azure OpenAI | Pay-per-token (text-embedding-3-small) | ~$0.10-$5 USD (light usage) |
| Azure OpenAI | Pay-per-token (gpt-4o-mini) | ~$1-$10 USD (light usage) |
| **Total** | | **~$13-$27 USD/month** |

💡 **Tip**: Set up **Azure Cost Alerts**:
- Go to **Cost Management + Billing**
- Create a **Budget** with alert at $20 to avoid surprises

---

## ✅ Verification Checklist

Before proceeding to code, verify:

- [ ] Resource Group created: `vote-ai-resources`
- [ ] PostgreSQL Flexible Server running
- [ ] PostgreSQL firewall allows your IP
- [ ] pgvector extension enabled
- [ ] DATABASE_URL connection string copied to `.env`
- [ ] Azure OpenAI resource created
- [ ] `text-embedding-3-small` model deployed
- [ ] `gpt-4o-mini` model deployed (optional)
- [ ] API Key and Endpoint copied to `.env`
- [ ] SECRET_KEY generated and added to `.env`
- [ ] Tested database connection with psql (optional)

---

## 🆘 Troubleshooting

### Issue: Can't connect to PostgreSQL from local machine

**Solution**:
1. Go to your PostgreSQL server in Azure Portal
2. Click **"Networking"** (under Settings)
3. Verify your IP is listed under **Firewall rules**
4. If not, click **"+ Add current client IP address"**
5. Click **"Save"**

### Issue: "The subscription is not registered to use namespace 'Microsoft.DBforPostgreSQL'"

**Solution**:
1. Go to **"Subscriptions"** in Azure Portal
2. Select your subscription
3. Click **"Resource providers"**
4. Search for `Microsoft.DBforPostgreSQL`
5. Click **"Register"**
6. Wait 5 minutes and try again

### Issue: "Azure OpenAI is not available in selected region"

**Solution**:
- Delete the resource
- Recreate in **East US** or **West Europe** (guaranteed availability)

### Issue: "Model text-embedding-3-small not found"

**Solution**:
- This model might be named differently in your region
- In Azure OpenAI Studio → Deployments → Create
- Look for models with "embedding" in the name
- Common alternatives: `text-embedding-ada-002`
- Update your `.env` file with the actual deployment name

---

## 🎯 Next Steps

Once you've completed all the steps above:

1. ✅ Verify all values in `backend/.env`
2. ✅ Test database connection
3. ✅ Proceed to **Step 4: Writing Authentication Code**

---

## 📚 Additional Resources

- [Azure PostgreSQL Documentation](https://learn.microsoft.com/en-us/azure/postgresql/)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [pgvector Extension Guide](https://github.com/pgvector/pgvector)
- [Azure Cost Management](https://learn.microsoft.com/en-us/azure/cost-management-billing/)

---

**Ready?** Once your Azure resources are set up and `.env` is configured, we can start writing the authentication code! 🚀

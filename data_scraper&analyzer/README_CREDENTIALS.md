# Setting Up Supabase Credentials

This guide explains how to set up your Supabase credentials to avoid the "Cannot check database - missing credentials" warning.

## Option 1: Environment Variables (Recommended)

Set these environment variables in your shell:

```bash
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_KEY="your-anon-key-here"
```

To make them permanent, add them to your shell profile file (`.bashrc`, `.zshrc`, etc.):

```bash
echo 'export SUPABASE_URL="https://your-project-id.supabase.co"' >> ~/.bashrc
echo 'export SUPABASE_KEY="your-anon-key-here"' >> ~/.bashrc
source ~/.bashrc
```

## Option 2: .env File

Create a `.env` file in the same directory as your scripts:

```bash
# .env file contents
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

**Important**: Never commit your `.env` file to version control!

## Option 3: Manual Setup in Code

You can also set credentials manually in your Python code:

```python
from enhanced_main import EnhancedPropsProcessor

processor = EnhancedPropsProcessor()
processor.set_credentials(
    url="https://your-project-id.supabase.co",
    key="your-anon-key-here"
)
```

## Finding Your Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" for `SUPABASE_URL`
4. Copy the "anon public" key for `SUPABASE_KEY`

## Testing the Setup

Run the example script to test your credentials:

```bash
python example_usage.py
```

This will show you the status of your credentials and test the database connection.

## Troubleshooting

- **"Cannot check database - missing credentials"**: Check that your environment variables are set correctly
- **"Database connection test failed"**: Verify your URL and key are correct
- **"Uploader is disabled"**: The system will still work but won't upload to Supabase

## Security Notes

- Use the "anon public" key, not the service role key
- The anon key is safe to use in client-side code
- Never expose your service role key
- Consider using environment variables for production deployments

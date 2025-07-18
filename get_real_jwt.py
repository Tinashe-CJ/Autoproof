#!/usr/bin/env python3
"""
Get a real JWT token from Clerk API
"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def get_real_jwt():
    """Get a real JWT token from Clerk"""
    
    clerk_secret_key = os.getenv('CLERK_SECRET_KEY')
    
    if not clerk_secret_key:
        print("❌ CLERK_SECRET_KEY not found in .env")
        return None
    
    print("🔑 Getting real JWT token from Clerk...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # First, get existing users
            print("   Getting existing users...")
            response = await client.get(
                "https://api.clerk.com/v1/users",
                headers={
                    "Authorization": f"Bearer {clerk_secret_key}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                users = response.json()
                if users and len(users) > 0:
                    user = users[0]  # Use the first user
                    user_id = user['id']
                    print(f"   Found user: {user_id}")
                    
                    # Create a session for this user
                    print("   Creating session...")
                    session_response = await client.post(
                        f"https://api.clerk.com/v1/users/{user_id}/sessions",
                        headers={
                            "Authorization": f"Bearer {clerk_secret_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "duration": 86400  # 24 hours
                        }
                    )
                    
                    if session_response.status_code == 200:
                        session_data = session_response.json()
                        jwt_token = session_data.get('jwt')
                        if jwt_token:
                            print("   ✅ Real JWT token obtained!")
                            return jwt_token
                        else:
                            print("   ❌ No JWT in session response")
                    else:
                        print(f"   ❌ Session creation failed: {session_response.status_code} - {session_response.text}")
                else:
                    print("   ❌ No users found")
            else:
                print(f"   ❌ Failed to get users: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return None

async def main():
    """Main function"""
    jwt = await get_real_jwt()
    if jwt:
        print(f"\nJWT Token: {jwt}")
    else:
        print("\n❌ Failed to get JWT token")

if __name__ == "__main__":
    asyncio.run(main()) 
#!/usr/bin/env node

/**
 * Test Meta Webhook Integration
 * Simulates webhook verification and message sending
 */

// Using Node.js built-in fetch (Node 18+)

const NGROK_URL = process.env.NGROK_URL || 'http://localhost:3000';
const WEBHOOK_URL = `${NGROK_URL}/api/webhooks/meta`;
const INBOX_URL = `${NGROK_URL}/api/inbox`;

async function testWebhookVerification() {
  console.log('\n🔍 Testing Webhook Verification...');
  
  const params = new URLSearchParams({
    'hub.mode': 'subscribe',
    'hub.verify_token': process.env.META_WEBHOOK_VERIFY_TOKEN || 'test_verify_token',
    'hub.challenge': 'test_challenge_12345'
  });

  try {
    const response = await fetch(`${WEBHOOK_URL}?${params}`);
    const text = await response.text();
    
    console.log('✅ Verification Response:', response.status, text);
    
    if (response.status === 200) {
      console.log('🎉 Webhook verification PASSED');
    } else {
      console.log('❌ Webhook verification FAILED');
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

async function testInstagramMessageWebhook() {
  console.log('\n📱 Testing Instagram Message Webhook...');
  
  const mockInstagramPayload = {
    object: 'instagram',
    entry: [{
      id: 'test_entry_123',
      time: Date.now(),
      messaging: [{
        sender: {
          id: 'test_sender_123',
          username: 'testuser'
        },
        recipient: {
          id: 'test_page_123'
        },
        timestamp: Date.now(),
        message: {
          text: 'Hello from test webhook!',
          mid: 'test_msg_123'
        }
      }]
    }]
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=test_signature' // Mock signature for testing
      },
      body: JSON.stringify(mockInstagramPayload)
    });

    const result = await response.json();
    console.log('✅ Message Webhook Response:', response.status, result);
    
    if (response.status === 200) {
      console.log('🎉 Instagram message webhook PASSED');
    } else {
      console.log('❌ Instagram message webhook FAILED');
    }
  } catch (error) {
    console.error('❌ Message webhook error:', error);
  }
}

async function testSendMessage() {
  console.log('\n📤 Testing Send Message API...');
  
  const messagePayload = {
    platform: 'instagram',
    recipient: 'test_recipient_123',
    message: 'Hello from test API!'
  };

  try {
    const response = await fetch(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();
    console.log('✅ Send Message Response:', response.status, result);
    
    if (response.status === 200) {
      console.log('🎉 Send message API PASSED');
    } else {
      console.log('❌ Send message API FAILED');
    }
  } catch (error) {
    console.error('❌ Send message error:', error);
  }
}

async function testGetMessages() {
  console.log('\n📥 Testing Get Messages API...');
  
  try {
    const response = await fetch(INBOX_URL);
    const result = await response.json();
    
    console.log('✅ Get Messages Response:', response.status, result);
    
    if (response.status === 200) {
      console.log(`🎉 Get messages API PASSED (${result.total} messages)`);
    } else {
      console.log('❌ Get messages API FAILED');
    }
  } catch (error) {
    console.error('❌ Get messages error:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Meta Webhook Integration Tests');
  console.log('📍 Testing against:', WEBHOOK_URL);
  console.log('📍 Inbox API:', INBOX_URL);
  
  // Check environment
  console.log('\n🔧 Environment Check:');
  console.log('- META_WEBHOOK_VERIFY_TOKEN:', process.env.META_WEBHOOK_VERIFY_TOKEN ? '✅' : '❌');
  console.log('- USER_ACCESS_TOKEN:', process.env.USER_ACCESS_TOKEN ? '✅' : '❌');
  console.log('- META_GRAPH_API_VERSION:', process.env.META_GRAPH_API_VERSION || 'v19.0');
  
  // Run tests
  await testWebhookVerification();
  await testInstagramMessageWebhook();
  await testSendMessage();
  await testGetMessages();
  
  console.log('\n🏁 Test Complete!');
  console.log('\n⭐ Use this URL in Meta Webhooks:');
  console.log(WEBHOOK_URL);
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testWebhookVerification, testInstagramMessageWebhook, testSendMessage, testGetMessages };

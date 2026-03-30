// Using native fetch


async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Agent',
                phone: '1234567890',
                email: 'test@agent.com',
                message: 'This is a test message from the debugger.'
            })
        });

        const status = res.status;
        const text = await res.text();

        console.log('Status:', status);
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

testApi();

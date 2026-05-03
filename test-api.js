// Using native fetch

async function test() {
  const url = 'https://www.youtube.com/shorts/pE96UaM_Z60'; // random public short
  const instance = 'https://cobalt.tools';
  
  try {
    const res = await fetch(instance, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        videoQuality: '720'
      })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error(e);
  }
}

test();

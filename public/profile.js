async function fetchProfile(username) {
  const response = await fetch(`http://localhost:3000/profile?username=${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });

  if (response.status === 200) {
    const userProfile = await response.json();
    return userProfile.user;
  } else {
    const error = await response.json();
    alert(error.error);
    return null;
  }
}

async function displayProfile(user) {
  if (!user) return;

  const userProfile = await fetchProfile(user.username);
  if (!userProfile) return;

  // 将用户信息显示在页面上
  document.querySelector('#username').textContent = userProfile.username;
  document.querySelector('#email').textContent = userProfile.email;
  document.querySelector('#licensePlate').textContent = userProfile.licensePlate;
}

document.addEventListener('DOMContentLoaded', async () => {
  // 获取存储在 localStorage 中的用户信息
  const user = JSON.parse(localStorage.getItem('user'));

  // 如果用户未登录，则重定向到登录页面
  if (!user) {
    window.location.href = 'signin.html';
    return;
  }

  await displayProfile(user);

  // 处理注销操作
  document.querySelector('#logout').addEventListener('click', () => {
    // 清除本地存储中的用户信息
    localStorage.removeItem('user');

    // 重定向到登录页面
    window.location.href = 'signin.html';
  });
});

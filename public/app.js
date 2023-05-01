const form = document.querySelector('#signupForm');
const passwordInput = form.querySelector('#password');
const confirmPasswordInput = form.querySelector('#confirm_password');

confirmPasswordInput.addEventListener('input', () => {
  if (confirmPasswordInput.value !== passwordInput.value) {
    confirmPasswordInput.setCustomValidity('Passwords do not match');
  } else {
    confirmPasswordInput.setCustomValidity('');
  }
});

async function signUp(event) {
  event.preventDefault(); // 防止表单提交

  // 如果表单无效，退出
  if (!form.checkValidity()) {
    return;
  }

  const username = form.querySelector('#username').value;
  const email = form.querySelector('#email').value;
  const password = passwordInput.value;
  const licensePlate = form.querySelector('#licensePlate').value;

  const data = {
    username,
    email,
    password,
    licensePlate,
  };

  try {
    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify(data)
    });
  
    if (!response.ok) {
      const errorJson = await response.json();
      const errorMessage = errorJson.error || 'Unable to sign up';
      throw new Error(errorMessage);
    }
  
    alert('Sign up successfully!');
    window.location.href = 'signin.html';
  } catch (error) {
    console.error('Error signing up:', error.message);
  }
}

// Sign in function
function signIn(event) {
  event.preventDefault();

  const form = document.querySelector('#signinForm');
  const username = form.querySelector('#username').value;
  const password = form.querySelector('#password').value;

  const data = {
    username,
    password,
  };

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/signin');
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.onload = () => {
    if (xhr.status === 200) {
      // 登录成功，将用户信息存储到 localStorage
      const user = JSON.parse(xhr.responseText);
      localStorage.setItem('user', JSON.stringify(user));
    
      // 跳转到主页面
      alert('Sign in successfully!');
      window.location.href = '/index.html';
    } else {
      // 登录失败，显示错误消息
      const error = JSON.parse(xhr.responseText).error;
      alert(error);
    }
  };
  xhr.send(JSON.stringify(data));
}

async function checkUsernameExists(username) {
  const response = await fetch(`http://localhost:3000/check-username?username=${username}`);

  if (!response.ok) {
    console.error('Error checking username:', response.status);
    return false;
  }

  const result = await response.json();
  return result.exists;
}

const usernameInput = form.querySelector('#username');

usernameInput.addEventListener('input', async () => {
  const username = usernameInput.value;

  if (!username) {
    usernameInput.setCustomValidity('');
    return;
  }

  const exists = await checkUsernameExists(username);

  if (exists) {
    usernameInput.setCustomValidity('Username already exists');
  } else {
    usernameInput.setCustomValidity('');
  }
});

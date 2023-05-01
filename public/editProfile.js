document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const updateForm = document.querySelector('#editForm');
  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 获取表单数据
    const newEmail = updateForm.querySelector('#newEmail').value;
    const newLicensePlate = updateForm.querySelector('#newLicensePlate').value;

    const updateResponse = await fetch(`http://localhost:3000/profile/${user.username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({ email: newEmail, licensePlate: newLicensePlate }),
    });

    if (updateResponse.status === 200) {
      // 更新成功，更新本地存储的用户信息，并刷新页面
      const updatedUser = await updateResponse.json();
      user.email = updatedUser.email;
      user.licensePlate = updatedUser.licensePlate;
      localStorage.setItem('user', JSON.stringify(user));

      // 跳转回 profile 页面
      window.location.href = 'profile.html';
    } else {
      // 更新失败，显示错误消息
      const error = await updateResponse.json();
      alert(error.message);
    }
  });
});

  
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'signin.html';
  }
  
  async function fetchParkingRecords() {
    const user = JSON.parse(localStorage.getItem('user'));
    const plateNumber = user.licensePlate;
    const paymentButton = document.querySelector('#paymentForm button');
    
    try {
      const response = await fetch(`/api/parking-records?plateNumber=${plateNumber}`);
      const data = await response.json();
      const tbody = document.getElementById('paymentTableBody');
      const noParkingRecord = document.getElementById('noParkingRecord');
      const paymentTable = document.getElementById('paymentTable');
  
      if (data.records.length === 0) {
        noParkingRecord.style.display = 'block';
        paymentTable.style.display = 'none';
        paymentButton.disabled = true;
      } else {
        noParkingRecord.style.display = 'none';
        paymentTable.style.display = 'table';
        paymentButton.disabled = false;
  
        tbody.innerHTML = '';
        data.records.forEach(record => {
          const entryTime = new Date(record.entry_time);
          const currentTime = new Date();
          const timeDifference = currentTime - entryTime;
          const totalMinutes = Math.floor(timeDifference / (1000 * 60));
          const totalHours = Math.floor(totalMinutes / 60);
          const totalSeconds = Math.floor((timeDifference / 1000) % 60);
  
          const parkingDuration = `${totalHours}h ${totalMinutes % 60}m ${totalSeconds}s`;
  
          let cost = 0;
          if (totalMinutes > 15) {
            cost = Math.ceil((totalMinutes - 15) / 30) * 5;
            cost = Math.min(cost, 40);
          }
  
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${record.license_plate}</td>
            <td>${parkingDuration}</td>
            <td>$${cost.toFixed(2)}</td>
          `;
          tbody.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error fetching parking records:', error);
    }
  }
  
  async function confirmPayment(event) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const plateNumber = user.licensePlate;
  
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plateNumber })
      });
  
      if (!response.ok) {
        throw new Error('Not Found');
      }
  
      // 显示付款成功的弹窗
      alert('Payment successfully!');
  
      // 重新获取停车记录
      await fetchParkingRecords();
    } catch (error) {
      console.error('Error confirming payment:', error.message);
    }
  }
  
  window.onload = function() {
    fetchParkingRecords();
  };
  
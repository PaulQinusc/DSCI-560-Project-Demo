const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { spawn } = require('child_process');
const port = process.env.PORT || 3000;
const path = require('path');

app.use(express.static('public'));
app.use(cors({
  origin: ['http://localhost:3000', 'null'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/signin.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signin.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/profile.html'));
});

app.get('/payment.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/payment.html'));
});

app.get('/editProfile.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/editProfile.html'));
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/app.js'));
});

app.get('/payment.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/payment.js'));
});

app.get('/index.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.js'));
});

app.get('/profile.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/profile.js'));
});

app.get('/editProfile.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/editProfile.js'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/style.css'));
});

app.get('/index.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.css'));
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Whz980320!',
  database: 'userDatabase'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1);
  }

  console.log('Connected to MySQL database');
});

app.post('/signup', (req, res) => {
  const { username, email, password, licensePlate } = req.body;

  // 检查用户名是否已存在
  const checkUsernameSql = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkUsernameSql, [username], (err, results) => {
    if (err) {
      console.error('Error while checking username:', err);
      res.status(500).json({ error: 'Error checking username' });
      return;
    }

    if (results.length > 0) {
      // 用户名已存在，返回错误
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    // 用户名不存在，插入新用户
    const newUser = {
      username,
      email,
      password,
      licensePlate
    };

    console.log('New user:', newUser);

    const sql = 'INSERT INTO users SET ?';

    connection.query(sql, newUser, (err, result) => {
      if (err) {
        console.error('Error while registering user:', err);
        res.status(500).json({ error: 'Error registering user' });
        return;
      }

      res.status(200).json({ message: 'User registered successfully' });
    });
  });
});

app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  const checkCredentialsSql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(checkCredentialsSql, [username, password], (err, results) => {
    if (err) {
      console.error('Error while checking credentials:', err);
      res.status(500).json({ error: 'Error checking credentials' });
      return;
    }

    if (results.length > 0) {
      // 登录成功，返回成功消息
      res.status(200).json(results[0]);
    } else {
      // 无法找到匹配的用户，返回错误
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

app.get('/profile', (req, res) => {
  const username = req.query.username;

  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
      if (err) {
          res.status(500).json({ error: 'Error retrieving user information' });
      } else {
          res.status(200).json({ user: result[0] });
      }
  });
});

app.get('/api/parking-records', (req, res) => {
  const plateNumber = req.query.plateNumber;

  // 从数据库中获取停车记录
  const getParkingRecordsSql = 'SELECT * FROM parking_records WHERE license_plate = ? AND paid = 0';
  connection.query(getParkingRecordsSql, [plateNumber], (err, results) => {
    if (err) {
      console.error('Error while fetching parking records:', err);
      res.status(500).json({ error: 'Error fetching parking records' });
      return;
    }

    res.status(200).json({ records: results });
  });
});

app.get('/check-username', (req, res) => {
  const { username } = req.query;

  if (!username) {
    res.status(400).json({ error: 'Username parameter is required' });
    return;
  }

  const checkUsernameSql = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkUsernameSql, [username], (err, results) => {
    if (err) {
      console.error('Error while checking username:', err);
      res.status(500).json({ error: 'Error checking username' });
      return;
    }

    res.json({ exists: results.length > 0 });
  });
});

app.post('/api/confirm-payment', (req, res) => {
  const plateNumber = req.body.plateNumber;

  // 将支付状态更新为已支付，并将支付时间存储到数据库中
  const updatePaymentSql = 'UPDATE parking_records SET paid = 1, payment_time = NOW() WHERE license_plate = ? AND paid = 0';
  connection.query(updatePaymentSql, [plateNumber], (err, results) => {
    if (err) {
      console.error('Error while confirming payment:', err);
      res.status(500).json({ error: 'Error confirming payment' });
      return;
    }

    res.status(200).json({ message: 'Payment confirmed successfully' });
  });
});

app.post('/api/payment', (req, res) => {
  const plateNumber = req.body.plateNumber;

  // 更新数据库中的停车记录，将已付款的记录标记为已付款
  const updatePaymentSql = 'UPDATE parking_records SET paid = 1, payment_time = NOW() WHERE license_plate = ? AND paid = 0';
  connection.query(updatePaymentSql, [plateNumber], (err, result) => {
    if (err) {
      console.error('Error while updating payment record:', err);
      res.status(500).json({ error: 'Error updating payment record' });
      return;
    }

    res.status(200).json({ status: 'success' });
  });
});


app.post('/profile/:username', (req, res) => {
  const username = req.params.username;
  const updatedUser = {
    email: req.body.email,
    licensePlate: req.body.licensePlate
  };

  connection.query('UPDATE users SET ? WHERE username = ?', [updatedUser, username], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating user information' });
    } else {
      // 查询更新后的用户信息
      connection.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Error retrieving updated user information' });
        } else {
          res.status(200).json(result[0]);
        }
      });
    }
  });
});

app.post('/searchBlockSpace', (req, res) => {
const origin = req.body.origin;

const walkingDis = +req.body.walkingDis;
const pythonProcess = spawn('python', ['final_model.py', origin, walkingDis]);
console.log(walkingDis);
console.log(req.body);
pythonProcess.stdout.on('data', (data) => {
  const blockSpaces = JSON.parse(data);
  res.status(200).json({ blockSpaces });
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
  res.status(500).json({ error: 'An error occurred while running the Python script.' });
});

pythonProcess.on('close', (code) => {
  console.log(`Python script exited with code ${code}`);
  if (code !== 0) {
    res.status(500).json({ error: 'An error occurred while running the Python script.' });
  }
});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});


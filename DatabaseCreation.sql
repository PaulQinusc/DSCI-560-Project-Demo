CREATE DATABASE userDatabase;
Use userDatabase;
CREATE TABLE `parking_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `license_plate` varchar(10) NOT NULL,
  `entry_time` datetime NOT NULL,
  `payment_time` datetime DEFAULT NULL,
  `paid` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
);
CREATE TABLE `users` (
  `username` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `licensePlate` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`username`)
)
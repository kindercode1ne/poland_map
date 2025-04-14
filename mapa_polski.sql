CREATE DATABASE mapa_polski

CREATE TABLE IF NOT EXISTS cities (
   id INT AUTO_INCREMENT PRIMARY KEY,
   adminCode1 VARCHAR(10),
   lng FLOAT,
   geonameId INT UNIQUE,
   toponymName VARCHAR(100),
   countryId VARCHAR(10),
   fcl CHAR(1),
   population INT,
   countryCode CHAR(2),
   name VARCHAR(100),
   fclName VARCHAR(100),
   adminCodes1 VARCHAR(10),
   countryName VARCHAR(100),
   fcodeName VARCHAR(100),
   adminName1 VARCHAR(100),
   lat FLOAT,
   fcode VARCHAR(10)
);
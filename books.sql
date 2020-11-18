DROP TABLE IF EXISTS books;

CREATE TABLE books(
id SERIAL PRIMARY KEY,
author TEXT,
title TEXT,
isbn VARCHAR(255),
image_url VARCHAR(255),
description TEXT
);
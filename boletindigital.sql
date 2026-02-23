-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-02-2026 a las 03:28:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `boletindigital`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso`
--

CREATE TABLE `curso` (
  `id_curso` int(11) NOT NULL,
  `año` int(11) NOT NULL,
  `division` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `curso`
--

INSERT INTO `curso` (`id_curso`, `año`, `division`) VALUES
(3, 7, '1ra'),
(4, 7, '2da'),
(6, 7, '3ra');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materia`
--

CREATE TABLE `materia` (
  `id_materia` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materia`
--

INSERT INTO `materia` (`id_materia`, `nombre`) VALUES
(1, 'Matemática'),
(2, 'Inglés Técnico'),
(3, 'Marco Jurídico y Derechos del Trabajo'),
(4, 'TÉCNICA: Asistencia 2'),
(5, 'TÉCNICA: Autogestión'),
(6, 'TÉCNICA: Hardware 4'),
(7, 'TÉCNICA: Prácticas Profesionalizantes 2'),
(8, 'TÉCNICA: Programación 4'),
(9, 'TÉCNICA: Redes 3'),
(10, 'EDI: Arduino 3');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nota`
--

CREATE TABLE `nota` (
  `id_nota` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_materia` int(11) NOT NULL,
  `tipo_nota` enum('informe1_c1','informe2_c1','cuatrimestre1','informe1_c2','informe2_c2','cuatrimestre2','nota_final') NOT NULL,
  `nota` decimal(4,2) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `nota`
--

INSERT INTO `nota` (`id_nota`, `id_usuario`, `id_materia`, `tipo_nota`, `nota`, `fecha`) VALUES
(19, 35, 1, 'informe1_c1', 8.00, '2026-02-21 13:18:29'),
(20, 35, 2, 'informe1_c1', 8.00, '2026-02-21 13:18:37'),
(21, 35, 3, 'informe1_c1', 8.00, '2026-02-21 13:18:47'),
(22, 35, 4, 'informe1_c1', 9.00, '2026-02-21 13:19:15'),
(23, 35, 5, 'informe1_c1', 9.00, '2026-02-21 13:19:24'),
(24, 35, 6, 'informe1_c1', 7.00, '2026-02-21 13:19:37'),
(25, 35, 7, 'informe1_c1', 9.00, '2026-02-21 13:19:50'),
(26, 35, 8, 'informe1_c1', 7.00, '2026-02-21 13:20:02'),
(27, 35, 9, 'cuatrimestre1', 7.00, '2026-02-21 13:20:17'),
(28, 35, 10, 'informe2_c2', 7.00, '2026-02-21 13:20:29'),
(29, 35, 8, 'nota_final', 7.00, '2026-02-21 13:20:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `dni` int(8) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `rol` enum('administrador','alumnado') NOT NULL,
  `fecha_solicitud` datetime DEFAULT current_timestamp(),
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`id`, `nombre`, `dni`, `email`, `contraseña`, `rol`, `fecha_solicitud`, `estado`) VALUES
(1, 'fsdgdfgfd', 123451111, 'rtjtukruy@gmail.com', '$2b$10$2B4Eoue46Md7o96RaTw4Ee/JBDAXKwF7LL68KRrAQzN2VSxYahePK', 'administrador', '2026-02-18 17:06:59', 'aprobada'),
(2, 'pepe', 145535743, 'ejefsd@gmail.com', '$2b$10$xTBvY6oZJMkOO8NJcVPKeOKJVizAfGVighpDfKvVnelqvkJXlHws.', 'alumnado', '2026-02-18 17:16:49', 'rechazada'),
(3, 'bele', 47927398, 'berenicemamanivelardez@gmail.com', '$2b$10$hUM5lxQqP3LMjA4lh7pxv.hTAvLdCxs.cm0MSaV1G8EnadZP0N8AC', 'administrador', '2026-02-20 16:20:36', 'aprobada'),
(4, 'kasofsdogsdg', 12211335, 'dsadd@gmail.com', '$2b$10$YEMJgloGENWeDw.SrgK6YuPM3MUCOgdqUdFsqhmIvgwB7VA8Xh/iS', 'administrador', '2026-02-20 20:00:54', 'aprobada'),
(5, 'prueba', 44672163, 'prueba@gmail.com', '$2b$10$6LDCPM8mzmiic1lM3Ursw.34w7A3/aNZifnFvgYvU/u6N2.OpWIEu', 'administrador', '2026-02-20 21:02:48', 'aprobada'),
(6, 'prueba', 22334451, 'pruebaaa@gmail.com', '$2b$10$stp4JH/wV9Zhlyy/zsYX6O1cguCfWOXyuUarab9pUN4s2J3RL6bVK', 'administrador', '2026-02-20 21:08:26', 'aprobada'),
(7, 'lelela', 33778215, 'ahre@gmail.com', '$2b$10$sVvIpfWjvdBY19wH/V7b4uNysLWsR1aIxo5.Irup5t1rsi0lbQ4cu', 'administrador', '2026-02-20 21:08:54', 'aprobada'),
(8, 'pruebaalumnado', 88997742, 'pruebaalumnado@gmail.com', '$2b$10$fbw6WPM5TI3orVBEf5Dnqu0x74Ir8n45bY5Oocp5fI3mNA5xnHw.6', 'alumnado', '2026-02-20 21:09:19', 'aprobada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `dni` int(8) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `rol` enum('estudiante','alumnado','administrador') DEFAULT NULL,
  `id_curso` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `dni`, `email`, `contraseña`, `rol`, `id_curso`) VALUES
(1, 'Marco Coppolechia', 47268310, 'marcocoppolechia@gmail.com', '$2b$10$UuX9QQPP/7um/HYOsI899etKQybY5D6VFC78c1u2rwvL7hz6doEOK', 'administrador', NULL),
(30, 'admin', 77552297, 'admin@gmail.com', '$2b$10$FmFsB32tLMpekWEXfC2fYuQ.DOdw//pokj0GuAUf72TVsP1pcVTzG', 'administrador', NULL),
(34, 'alumnado', 33441123, 'alumnado@gmail.com', '$2b$10$Mln9rG4/u38m6aXcorCuxeTQnImzR8SdNNcO3ZlM3bxO0BYrUMA6K', 'alumnado', NULL),
(35, 'alumno1', 223311123, 'alumno1@gmail.com', '$2b$10$.SwleE1NwLWOoRDow.PR/uAQUKuoF30CSCzCe3TieuhwGdrLVDOy.', 'estudiante', 3),
(36, 'alumno2', 44223311, 'alumno2@gmail.com', '$2b$10$Em0zUZRMGz2Wq17Bbr4sFOSJWU7S16YT9otl1ko38/grAu8N8uISC', 'estudiante', 4),
(37, 'alumno3', 4465722, 'alumno3@gmail.com', '$2b$10$JpFROCgOkkdLflxKXhgTIekUeEbQ/p205f4omYRVqUKfkHaYIchVu', 'estudiante', 6);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`id_curso`);

--
-- Indices de la tabla `materia`
--
ALTER TABLE `materia`
  ADD PRIMARY KEY (`id_materia`);

--
-- Indices de la tabla `nota`
--
ALTER TABLE `nota`
  ADD PRIMARY KEY (`id_nota`),
  ADD UNIQUE KEY `unique_usuario_materia_tipo` (`id_usuario`,`id_materia`,`tipo_nota`),
  ADD KEY `id_materia` (`id_materia`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `fk_usuario_curso` (`id_curso`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `curso`
--
ALTER TABLE `curso`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `materia`
--
ALTER TABLE `materia`
  MODIFY `id_materia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `nota`
--
ALTER TABLE `nota`
  MODIFY `id_nota` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `nota`
--
ALTER TABLE `nota`
  ADD CONSTRAINT `nota_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `nota_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `materia` (`id_materia`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


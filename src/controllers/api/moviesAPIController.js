const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require('sequelize');
const moment = require('moment');
const fetch = require('node-fetch');
const { response } = require('express');

//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;
const API = 'https://www.omdbapi.com/?apikey=c0878dc0';

const moviesAPIController = {
	list: (req, res) => {
		db.Movie.findAll({
			include: ['genre'],
		}).then((movies) => {
			let respuesta = {
				meta: {
					status: 200,
					total: movies.length,
					url: 'api/movies',
				},
				data: movies,
			};
			res.json(respuesta);
		});
	},
	detail: (req, res) => {
		db.Movie.findByPk(req.params.id, {
			include: ['genre'],
		}).then((movie) => {
			let respuesta = {
				meta: {
					status: 200,
					//total: movie.length,
					url: '/api/movie/:id',
				},
				data: movie,
			};
			res.json(respuesta);
		});
	},
	recomended: (req, res) => {
		db.Movie.findAll({
			include: ['genre'],
			where: {
				rating: { [db.Sequelize.Op.gte]: req.params.rating },
			},
			order: [['rating', 'DESC']],
		})
			.then((movies) => {
				let respuesta = {
					meta: {
						status: 200,
						total: movies.length,
						url: 'api/movies/recomended/:rating',
					},
					data: movies,
				};
				res.json(respuesta);
			})
			.catch((error) => console.log(error));
	},
	create: (req, res) => {
		Movies.create({
			title: req.body.title,
			rating: req.body.rating,
			awards: req.body.awards,
			release_date: req.body.release_date,
			length: req.body.length,
			genre_id: req.body.genre_id,
		})
			.then((confirm) => {
				let respuesta;
				if (confirm) {
					respuesta = {
						meta: {
							status: 200,
							total: confirm.length,
							url: 'api/movies/create',
						},
						data: confirm,
					};
				} else {
					respuesta = {
						meta: {
							status: 200,
							total: confirm.length,
							url: 'api/movies/create',
						},
						data: confirm,
					};
				}
				res.json(respuesta);
			})
			.catch((error) => res.send(error));
	},
	update: (req, res) => {
		let movieId = req.params.id;
		Movies.update(
			{
				title: req.body.title,
				rating: req.body.rating,
				awards: req.body.awards,
				release_date: req.body.release_date,
				length: req.body.length,
				genre_id: req.body.genre_id,
			},
			{
				where: { id: movieId },
			}
		)
			.then((confirm) => {
				let respuesta;
				if (confirm) {
					respuesta = {
						meta: {
							status: 200,
							total: confirm.length,
							url: 'api/movies/update/:id',
						},
						data: confirm,
					};
				} else {
					respuesta = {
						meta: {
							status: 204,
							total: confirm.length,
							url: 'api/movies/update/:id',
						},
						data: confirm,
					};
				}
				res.json(respuesta);
			})
			.catch((error) => res.send(error));
	},
	destroy: (req, res) => {
		let movieId = req.params.id;
		Movies.destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
			.then((confirm) => {
				let respuesta;
				if (confirm) {
					respuesta = {
						meta: {
							status: 200,
							total: confirm.length,
							url: 'api/movies/destroy/:id',
						},
						data: confirm,
					};
				} else {
					respuesta = {
						meta: {
							status: 204,
							total: confirm.length,
							url: 'api/movies/destroy/:id',
						},
						data: confirm,
					};
				}
				res.json(respuesta);
			})
			.catch((error) => res.send(error));
	},
	search: (req, res) => {
		// res.send('hola');
		//Primero buscamos la pelicula en la base de datos
		Movies.findOne({ where: { title: { [Op.like]: '%' + req.body.titulo + '%' } } }).then((movie) => {
			console.log(movie);
			if (movie) {
				res.render('moviesDetail', { movie });
			} else {
				let titulo = req.body.titulo;
				fetch(`${API}&t=` + titulo)
					.then((response) => response.json())
					.then((movie) => {
						console.log(movie);
						res.render('moviesDetailOMdb.ejs', { movie });
					})
					.catch((error) => res.send(error));

				// let response = await fetch(API + '&t=' + req.query.titulo); //El fetch trae un response
				// let movie = await response.json();
				// res.render('movieDetail', {movie})
			}
		});
	},
};

module.exports = moviesAPIController;

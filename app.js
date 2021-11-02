require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const ytdl = require("ytdl-core");

const { google } = require("googleapis");
const youtube = google.youtube("v3");

app.get("/:playlistId", async (req, res) => {
	let responseObj = [];
	const sleep = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	// PLu0W_9lII9agiCUZYRsvtGTXdxkzPyItg - CodeWithHarry MERN Playlist
	let playlistID = req.params.playlistId;

	await youtube.playlistItems.list(
		{
			key: process.env.apiKey,
			part: "id,snippet",
			playlistId: playlistID,
			// playlistId: playlistID.substring(
			// 	"https://www.youtube.com/playlist?list=".length,
			// ),
			maxResults: 200,
		},
		async (err, results) => {
			console.log({ results });
			if (err) return console.log(err.message);
			let data = results.data.items;
			let i = 0;
			for (let video of data) {
				// push the video id to the array
				responseObj.push({
					id: video.snippet.resourceId?.videoId,
					title: video.snippet.title.replace(/[^a-zA-Z ]/g, ""),
				});

				let videoID = video.snippet.resourceId?.videoId;
				console.log({ videoID });
				try {
					await new Promise((resolve, reject) => {
						// console.log(`Downloading: ${video.snippet.title}`);
						let file = ytdl(
							`https://www.youtube.com/watch?v=${videoID}`,
							{
								format: "mp4",
							},
						).pipe(
							fs.createWriteStream(
								path.join(
									__dirname,
									"./videos",
									`${i++}-${video.snippet.title.replace(
										/[^a-zA-Z ]/g,
										"",
									)}.mp4`,
								),
							),
						);

						file.on("error", (err) => {
							console.log(
								`Error Downloading: ${video.snippet.title}`,
							);
							reject(err);
						});

						file.on("close", () => {
							console.log(`Downloaded: ${video.snippet.title}`);
							resolve("Download Success!!!");
						});
					});
				} catch (err) {
					console.log(err.message);
				}
			}
			console.log({ responseObj }, { length: responseObj.length });
			res.json(responseObj);
		},
	);
});

app.listen(5000, (req, res) => {
	console.log("Server is running on port 5000");
});

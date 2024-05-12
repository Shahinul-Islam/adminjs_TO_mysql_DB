import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { Sequelize, DataTypes } from "sequelize";
import * as AdminJSSequelize from "@adminjs/sequelize";
import { Database, Resource } from "@adminjs/sequelize";

AdminJS.registerAdapter({
	Database: AdminJSSequelize.Database,
	Resource: AdminJSSequelize.Resource,
});
const PORT = 3000;
dotenv.config();

const app = express();
app.use(cors());
const start = async () => {
	const adminRouter = AdminJSExpress.buildRouter(admin);
	app.use(admin.options.rootPath, adminRouter);

	app.listen(PORT, () => {
		console.log(
			`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`
		);
	});
};

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.USER_NAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
	}
);

try {
	await sequelize.authenticate();
	console.log("Connection has been established successfully.");
} catch (error) {
	console.error("Unable to connect to the database:", error);
}

// console.log(admin.options.databases);
// const $query = "SELECT * FROM wp_users";
// Define the Sequelize model for wp_users
const User = sequelize.define(
	"wp_users",
	{
		ID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_login: {
			type: DataTypes.STRING,
		},
		user_pass: {
			type: DataTypes.STRING,
		},
		user_nicename: {
			type: DataTypes.STRING,
		},
		user_email: {
			type: DataTypes.STRING,
		},
		user_url: {
			type: DataTypes.STRING,
		},
	},
	{
		timestamps: false,
	}
);
const userResource = {
	resource: User, // Pass your Sequelize model here
	options: {
		properties: {
			user_login: {
				// Define how each property should be displayed
				isVisible: {
					// Specify if the property should be visible
					list: true, // Display in list view
					show: true, // Display in show view
					edit: true, // Display in edit view
				},
			},
			user_email: {
				// Define how each property should be displayed
				isVisible: {
					// Specify if the property should be visible
					list: true, // Display in list view
					show: true, // Display in show view
					edit: true, // Display in edit view
				},
			},
			// Add other properties as needed
		},
	},
};
const admin = new AdminJS({
	resources: [userResource],
	databases: [sequelize],
});
// Fetch all users from the wp_users table
// const users = await User.findAll();
app.get("/api/users", async (req, res) => {
	try {
		// Fetch all users from the wp_users table
		const users = await User.findAll();

		// Extract the relevant user data values
		const userData = users.map((user) => user.dataValues);

		// Return the user data in JSON format
		res.json(userData);
	} catch (error) {
		console.error("Error fetching user data:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Route handler to get individual user information by ID
app.get("/api/users/:id", async (req, res) => {
	const { id } = req.params;
	try {
		// Find the user by ID
		const user = await User.findByPk(id);

		// If user not found, return 404
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Return the user data in JSON format
		res.json(user);
	} catch (error) {
		console.error("Error fetching user data:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});
// Log the list of users
// console.log(users[1].dataValues);
// for (let index = 0; index < users.length; index++) {
// 	const element = users[index];
// 	console.log(element.dataValues);
// }

start();

// close database connection
// sequelize.close()

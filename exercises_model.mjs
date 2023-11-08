import mongoose from 'mongoose';
import 'dotenv/config';
import { response } from 'express';

mongoose.connect(
    process.env.MONGODB_CONNECT_STRING,
    {dbName: 'exercises'},
    { useNewUrlParser: true }
);

// Connect to to the database
const db = mongoose.connection;
// The open event is called when the database connection successfully opens
db.once("open", () => {
    console.log("Successfully connected to MongoDB using Mongoose!");
});

// schema

const exerciseSchema = mongoose.Schema({
    name: {type: String, required: true},
    reps: {type: Number, required: true},
    weight: {type: Number, required: true},
    unit: {type: String, required: true},
    date: {type: String, required: true}
});

// Compile model from the Schema

const Exercise = mongoose.model("Exercise", exerciseSchema);

// Create
const addExercise = async (name, reps, weight, unit, date) => {
    const exercise = new Exercise({name: name, reps: reps, 
        weight: weight, unit: unit, date: date});

    return exercise.save();
}

// Read/Retrieve All
const getAllExercises = async() => {
    const query = Exercise.find();
    return query.exec();
}

// Read/Retrieve One
const getOneExercise = async (id) => {
    const query = Exercise.findById(id);
    return query.exec();
}

// Update
const updateExercise = async (id, updates) => {
    const result = Exercise.findByIdAndUpdate(id, updates, {new: true});
    return result;
}

// Delete
const deleteExercise = async (id) => {
    const result = Exercise.findByIdAndDelete(id);
    return result;
}

export {addExercise, getAllExercises, getOneExercise, updateExercise, deleteExercise};
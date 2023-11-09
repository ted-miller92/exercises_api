import mongoose from "mongoose";
import "dotenv/config";

// schema
const exerciseSchema = new mongoose.Schema({
    name: {type: String, required: true},
    reps: {type: Number, required: true},
    weight: {type: Number, required: true},
    unit: {type: String, required: true},
    date: {type: String, required: true}
});

// Compile model from the Schema
const Exercise = mongoose.model("Exercise", exerciseSchema);

// Create
const addExercise = async (name: string, 
                            reps: number, 
                            weight: number, 
                            unit: string, 
                            date: string) => {
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
const getOneExercise = async (id: string) => {
    const query = Exercise.findById(id);
    return query.exec();
}

// Update
const updateExercise = async (id: string, updates: object) => {
    const result = Exercise.findByIdAndUpdate(id, updates, {new: true});
    return result;
}

// Delete
const deleteExercise = async (id: string) => {
    const result = Exercise.findByIdAndDelete(id);
    return result;
}

export {addExercise, getAllExercises, getOneExercise, updateExercise, deleteExercise};
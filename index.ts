import express from "express";
import mongoose from "mongoose";
import asyncHandler from 'express-async-handler';
import { body, check, validationResult } from 'express-validator';
import { isDateValid } from './validation/date_validation';
import "dotenv/config";

import * as exercises from "./models/exercises_model";

const PORT = process.env.PORT
const app = express();

mongoose.connect(process.env.MONGODB_CONNECT_STRING!,
    {dbName: "exercises"}
);

const db = mongoose.connection;

db.once("open", () => {
    console.log("Successfully connected to MongoDB with Mongoose");
});

app.get('/', (req: any, res: any) => {
    res.status(200).send({Message: "Loud and clear"});
});

/*  Read/retrieve all
*   returns JSON array containing entire collection of exercises */
app.get('/exercises', asyncHandler(async (req, res) => {
    const result = await exercises.getAllExercises();
    res.send(result);
}));

/*  Create an exercise 
*   This route handler validates data using express-validator
*   and isDateValid() provided by instructors
*   All fields are required */
app.post('/exercises', [
    check('name', 'Name should be a string').notEmpty().isAlpha('en-US', {ignore: ' '}),
    check('reps', 'Reps should be numeric and greater than 0').notEmpty().isInt({ min:1 }),
    check('weight', 'Weight must be numeric and above 0').notEmpty().isInt({ min:1 }),
    check('unit', 'Must include units').notEmpty().custom( async weight => {
        // validation for weight (must be string 'kgs' or l'bs')
        if (weight != 'kgs' && weight != 'lbs'){
            throw new Error("Unit must be kgs or lbs");
        }
    }),
    body('date', 'invalid').notEmpty().custom( async date => {
        if (!isDateValid(date)) {
            throw new Error("Invalid date format");
        }
    })],
    asyncHandler(async (req, res) => {
        
        // store any errors thrown in the validationResult object
        const errors = validationResult(req);
        
        // if validationResult object is not empty, response includes error information
        if (!errors.isEmpty()){
            // log to API console
            console.log(errors);
            // send errors object to client
            res.status(400).json({errors: errors.array()});
        } else {
            const exercise = await exercises.addExercise(req.body.name, req.body.reps, 
                req.body.weight, req.body.unit, req.body.date);
            res.status(201).send(exercise);
        }
}));

/*  Read/retrieve single exercise, given parameter _id
*   Sends 404 if not found */
app.get('/exercises/:_id', asyncHandler(async (req, res) => {
    const result = await exercises.getOneExercise(req.params._id);
    
    if (!result){
        res.status(404).json({Error : "Not found"});
    } else {
        res.status(200).send(result);
    }
}));

/*  Update exercise, given parameter _id
*   If any fields are invalid, returns 400
*   If the exercise with the given _id doesn't exist, returns 404 */
app.put('/exercises/:_id', [
    check('name', 'Name should be a string').notEmpty().isAlpha('en-US', {ignore: ' '}),
    check('reps', 'Reps should be numeric and greater than 0').notEmpty().isInt({ min:1 }),
    check('weight', 'Weight must be numeric and above 0').notEmpty().isInt({ min:1 }),
    check('unit', 'Must include units').notEmpty().custom( async weight => {
        // validation for weight (must be string 'kgs' or lbs')
        if (weight != 'kgs' && weight != 'lbs'){
            throw new Error("Unit must be kgs or lbs");
        }
    }),
    body('date', 'Invalid date').notEmpty().custom( async date => {
        if (!isDateValid(date)) {
            throw new Error("Invalid date format");
        }
    })], 
    asyncHandler(async (req, res) => {

        // fill errors object if there were errors
        const errors = validationResult(req);

        // if errors is empty, we can then talk to the model layer
        if (errors.isEmpty()){

            // send request
            const updates = req.body;
            const result = await exercises.updateExercise(req.params!._id, updates);
            
            // check that resource exists
            if (!result){
                res.status(404).json({Error : "Not found"});
            } else {
                res.status(200).send(result);
            }
        } else {
            // send validation errors
            res.status(400).json({errors: errors.array()});
        }
}));

/*  Delete exercise with given _id
*   if resource doesn't exist, returns 404 */
app.delete('/exercises/:_id', asyncHandler(async (req, res) => {
    const result = await exercises.deleteExercise(req.params._id);

    if (!result){
        res.status(404).json({Error: "Not found"});
    } else {
        res.status(204).send(result);
    }
}));

app.listen(3000, () => {    
    console.log(`Listening on port ${PORT}`);
});
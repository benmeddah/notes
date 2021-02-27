const express = require('express');
const app = express();
const request = require("supertest");

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const { validationResult,checkSchema } = require('express-validator');

const errorMessage = "invalide request : password must be strong"

const validlogin = checkSchema({
    username:{
        optional: false,
        isAlphanumeric:true,
        isLength:{
            options:{
                min:3,
                max:20
            }
        },
        errorMessage
    },
    password:{
        optional:false,
        isStrongPassword:true,
        errorMessage
    }
})


const data = {username:'jon',password:"Asassword123456*"}

const mainHandler = async (req, rep) => {
    rep.send({session : req.body.username + ' ' + req.body.password})
}
const errHandler = async (req, rep,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        next(new Error(errors.array()[0].msg))
    }
    else next()
}

app.post('/simple',validlogin,errHandler,mainHandler)

app.use(async (error,req, rep,next) => {
    if (error) rep.json({err : error.message})
})

test('login with erreur', async () => {
const response = await request(app).post("/simple").
send({username:'jo',password:"psassword123456*"})
expect(JSON.parse(response.text).err).toBe("invalide request : password must be strong");
})


test('login without erreur', async () => {
    const response = await request(app).post("/simple").
    send({username:data.username,password:data.password})
    expect(JSON.parse(response.text).session).toBe(data.username+" "+data.password);
    })

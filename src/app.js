const a=require("express");
const app=a();

app.use("/hello",(req,res)=>{
    res.send("namaste this is from hello");
});

app.use("/venom", (req,res)=>{
    res.send("namaste this is from venom");
});

app.use((req,res)=>{
    res.send("namaste is from main normal");
});


app.listen(7676,()=>{
    console.log("server is succesfully on port 7676");
});


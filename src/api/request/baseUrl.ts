let baseUrl = "localhost:3000";

if(process.env.NODE_ENV==="production"){
    baseUrl = "xxxxxxxxxxxxxx";
}else if(process.env.NODE_ENV === "development") {
    baseUrl = "http://localhost:8060/distribute-game-oss/"
}

export default baseUrl;
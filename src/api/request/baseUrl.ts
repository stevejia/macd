let baseUrl = "localhost:3000";

if(process.env.NODE_ENV==="production"){
    baseUrl = "xxxxxxxxxxxxxx";
}else if(process.env.NODE_ENV === "development") {
    baseUrl = "http://localhost:8080/distribute-game-oss/"
}

export default baseUrl;
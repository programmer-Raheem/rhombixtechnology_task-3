var isStatus = document.querySelector("h5");
var addFriend = document.querySelector("#friend");
let remove=document.querySelector("#remove");

remove.addEventListener("click", function () {
  isStatus.innerHTML = "stranger";
  isStatus.style.color="red";
});
addFriend.addEventListener("click", function () {
  isStatus.innerHTML = "Friends";
   isStatus.style.color="green";

});

const client = contentful.createClient({
  space: "ry1q1c1mx3t4",
  accessToken: "mh_-itDvSunpmXBo57xFsfFJ1J72-9IEJarJ1de6tb8",
});

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const loading = document.querySelector("#loading");
window.addEventListener("load", ()=>{
    loading.style.display = "none";
    document.body.classList.remove('scrollable');
})

let cart = [];
let buttonsDOM = [];

// getting the products
class Products{
    async getProducts(){
     try{
        let contentful = await client
        .getEntries({content_type: "store" })
        // let result = await fetch("products.json");
        // let data = await result.json();
        // console.log(contentful);
        let products = contentful.items.map((item) => {
        const {title, price} = item.fields;
        const {id} = item.sys;
         const image = item.fields.image.fields.file.url;
        return  {title, price, id, image};
        })
        return products;
     }
    catch (error){
        console.log(error);
     }
}
}
 
// displaying the prducts
class UI{
    displayProducts(products){
        console.log(products)
     products = products.map((product) => {
            return `<!-- single product -->
            <article class="product">
            <div id = "container">
            <div class="img-container">
           <img src="${product.image}" alt="product" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                  <i class="fas fa-shopping-cart"></i>
                  add to cart
                </button>
              </div>
            
            <div class="flex-end">
              <h3>${product.title}</h3>
              <h4>NPR${product.price}</h4>
              </div>
              </div>
            </article>
            <!-- end of single product -->`
         
     }).join("");
     productsDOM.innerHTML = products;
     
    const btns = [...document.querySelectorAll(".bag-btn")];
     buttonsDOM = btns;
    console.log(buttonsDOM)
    btns.forEach((btn) => {
        let id = btn.dataset.id;
        let inCart = cart.find(item => item.id === id);
        if(inCart){
            btn.innerText = "In Cart"
            btn.disabled = true;
        }
        btn.addEventListener("click", (e) => {
            e.target.innerText = "In Cart";
            e.target.disabled = true;

            let cartItem = {...Storage.getProduct(id), amount: 1};
            console.log(cartItem)
            cart = [...cart,cartItem];
             console.log(cart)
            //save cart in local storage
            localStorage.setItem("cart", JSON.stringify(cart));
            //set cart values
            this.setCartValues(cart);
            //add cart 
            this.addCartItem(cartItem);
            //show cart
            this.showCart();
        })
      })
    }
     setCartValues(cart){
        let Total = 0;
        let itemsTotal = 0;
        cart.map(item => {
            Total += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(Total.toFixed(2))
        cartItems.innerText = itemsTotal;
        console.log(cartTotal, cartItems);
    }
    addCartItem(item){
        const div  = document.createElement('div');
        div.classList.add("cart-item");
        div.innerHTML = ` <img src="${item.image}" alt="product" />
        <div>
          <h4>${item.title}</h4>
          <h5>NPR${item.price}</h5>
          <span class="remove-item" data-id = ${item.id}>Remove</span>
        </div>
        <div>
          <i class="fas fa-chevron-up"  data-id = ${item.id}></i>
          <p class="item-amount">
            ${item.amount}
          </p>
          <i class="fas fa-chevron-down" data-id = ${item.id}></i>
        </div>
      </div>`
        cartContent.appendChild(div);
      
    }
    showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
        console.log(this);
    }
    setup(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.putInCart(cart);
        cartBtn.addEventListener("click", this.showCart)
        closeCartBtn.addEventListener("click", () => {
            cartOverlay.classList.remove("transparentBcg");
            cartDOM.classList.remove("showCart");
        })
        cartOverlay.addEventListener("click", (e)=>{
            e.target.classList.remove("transparentBcg");
            cartDOM.classList.remove("showCart");
        })
    }
    putInCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    cartLogic(){
        //clear cart button
        clearCartBtn.addEventListener("click",()=>{
            this.clearCart()})
        //cart functionality
        cartContent.addEventListener("click", e => {
            if(e.target.classList.contains("remove-item")){
              let id = e.target.dataset.id;
              e.target.parentElement.parentElement.remove();
              this.removeItem(id);
            }
            else if(e.target.classList.contains("fa-chevron-up")){
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(e.target.classList.contains("fa-chevron-down")){
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount -= 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
               
            }
        })
    }
    clearCart(){
        console.log(cart);
        let cartItems = cart.map(item => item.id);
        console.log(cartItems);
        cartItems.forEach(id => this.removeItem(id));
       cartContent.innerHTML = "";
    //    if(cartContent.children.length > 0){
    //     cartContent.removeChild(cartContent.children[0])
    // }
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    removeItem(id){
        console.log(id);
        cart = cart.filter(item => item.id != id)
        console.log(cart);
        this.setCartValues(cart);   
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        console.log(button);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id){
        console.log(id);
        console.log(buttonsDOM)
        return buttonsDOM.find((button) => button.dataset.id == id);
    }

}

//local Storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id == id);
    }
    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
    }
}

document.addEventListener("DOMContentLoaded", ()=> {
    const ui = new UI();
    const products = new Products();
    //setup
    ui.setup()
    // get all products
    products.getProducts().then((products) => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        ui.cartLogic();
    })
})



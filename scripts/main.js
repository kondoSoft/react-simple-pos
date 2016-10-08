var React = require('react')
var ReactDOM = require('react-dom')

var ReactRouter = require('react-router')
var Router = ReactRouter.Router,
    Route = ReactRouter.Route,
    browserHistory = ReactRouter.browserHistory,
    Navigation = ReactRouter.Navigation// MIXIN,
    History = ReactRouter.History

var h = require('./helpers')
var lang = require('./lang-es')

// Fire Base
var rebase = require('re-base')
var base = rebase.createClass({
  apiKey: "ysd9F9y4Eeoc1mgcurN65ngDUBsYjdIGAZxE9WP2",
  authDomain: "online-store-24885.firebaseapp.com",
  databaseURL: "https://online-store-24885.firebaseio.com",
  storageBucket: "online-store-24885.appspot.com",

})


// var browserHistory = require('history/lib/createBrowserHistory')// This is a function I am just executing here stead of 86L


// App component

var App = React.createClass({
  getInitialState : function(){
    return{
      lang : {},
      fishes : {},
      orders : {},
      lang : {}
    }
  },
  componentDidMount :function(){
    base.syncState(this.props.params.storeId + '/fishes', {
      context : this,
      state : 'fishes'
    })
    // lang = require('./lang-'+this.props.lang)
  },
  componentWillUpdate :function(nextProps, nextState){

    var item = ('order-' + this.props.params.storeId, JSON.stringify(nextState.order))
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order))
  },
  addFish : function(fish){
    var timestamp = new Date().getTime()
    this.state.fishes['fish-' + timestamp] = fish
    this.setState({ fishes : this.state.fishes })
  },addOrder : function(fish){
    this.state.orders[fish] = this.state.orders[fish]+1 || 1
    this.setState({ orders: this.state.orders })
  },
  loadSamples : function(){
    this.setState({ fishes : require('./sample-fishes')})
  },
  renderFish: function(key){
    return <Fish key={key} index={key} details={this.state.fishes[key]} addOrder={this.addOrder}/>
  },
  render : function(){
    return (
      <div className='catch-of-the-day'>
        <div className='menu'>
          <Header tagline='Fresh Seafood Market' />
          <ul className='list-of-fishes'>
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} orders={this.state.orders}/>
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples}/>
      </div>
    )
  }
})

// Header component

var Header = React.createClass({
  render : function(){
    return (
      <header className='top'>
        <h1>Ferretería</h1>
        <h3 className='tagline'><span>{this.props.tagline}</span></h3>
      </header>
    )
  }
})

// Order component
var Order = React.createClass({
  renderOrderItems:function(key){
    var order = this.props.orders[key]
    var fish = this.props.fishes[key]

    return (
      <li key = {key}>
      {order} lbs
       {fish.name}
      <span className='price'>{h.formatPrice(order * fish.price)}</span>
      </li>
    )

  },

  render : function(){
      var orders = this.props.orders
      var fishes = this.props.fishes
      var ordersKeys = Object.keys(orders)

      var total = ordersKeys.reduce((p, k)=>{

        var fish = fishes[k]
        var count = orders[k]
        var isAvailabe = fish && fish.status === 'available'
        if(fish && isAvailabe){
          return p + (count * parseInt(fish.price) || 0)
        }
        return p
      },0)
      return (
        <div className='order-wrap'>
          <h2 className='order-title'>{lang._your_order}</h2>
          <ul className='order'>
            { ordersKeys.map(this.renderOrderItems) /* Every time it is render, render the list of items*/}
            <li className='total'>
              <strong>{lang._total}:</strong>
              {h.formatPrice(total)}
            </li>
          </ul>
        </div>
      )
  }
})

// Inventory
var Inventory = React.createClass({
  render : function(){
    return (
      <div>
        <h2>{lang._inventory}</h2>
        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}>{lang._load_sample}</button>
      </div>
    )
  }
})

var SelectLanguage = React.createClass({
  render: function(){
    return(
      <span> <a href="#" onClick={this.props.changeLanguage.bind(this, 'en')}>en</a> | <a href="#" onClick={this.props.changeLanguage.bind(this, 'es')}>es</a></span>
    )
  }
})
// We will start with StorePiker

var StorePiker = React.createClass({
  getInitialState:function(){
    return {
      lang : require('./lang-en')
    }
  },
  goToStore : function(event){
    event.preventDefault()
    var storeId = this.refs.storeId.value
    var lang = this.refs.lang.value
    browserHistory.push('/'+lang+'/' + storeId)
  },
  render : function(){
    return(
      <div>
        <form className='store-selector' onSubmit={this.goToStore}>
          <h2>{lang._pick_a_store}</h2>
          <input type='text' ref='storeId' defaultValue={h.getFunName()} required/>
          <button type='Submit'> {lang._go_to_store} </button>

          <div>
            <select ref='lang'>
              <option value='en'>English</option>
              <option value='es'>Español</option>
            </select>
          </div>
        </form>
      </div>

    )
  }
})

// Add fish form

var AddFishForm = React.createClass({
  createFish : function(event){
    event.preventDefault()
    var fish = {
      name : this.refs.name.value,
      price : this.refs.price.value,
      status : this.refs.status.value,
      desc : this.refs.desc.value,
      image : this.refs.image.value,
    }
    this.props.addFish(fish)
    this.refs.form.reset()

  },
  render : function(){
    return (
      <form className='fish-edit' ref='form' onSubmit={this.createFish}>
        <input type='text' ref='name' placeholder={lang._name}/>
        <input type='text' ref='price' placeholder={lang._price}/>
        <select ref = 'status'>
          <option value='available'>{lang._available}</option>
          <option value='unavailable'>{lang._sold_out}</option>
        </select>
        <textarea type='text' ref='desc' placeholder={lang._desc}></textarea>
        <input type='text' ref='image' placeholder={lang._URL}/>
        <button type='submit'> + {lang._add_item}</button>
      </form>
    )
  }
})

var Fish = React.createClass({
  placeOrder : function(){
    this.props.addOrder(this.props.index)
  },
  render : function(){
    var fish = this.props.details
    var isAvailabe = (fish.status == 'available' ? true : false)
    var btnText = (isAvailabe == true ? 'Add to cart' : 'Sold Out')

    return(
      <li className='menu-fish'>
        <img src={fish.image} alt={fish.name}/>
        <h3 className='fish-name'>
          {fish.name}
          <span className='price'>{h.formatPrice(fish.price)}</span>
        </h3>
        <p>{fish.desc}</p>
        <button onClick={this.placeOrder} disabled={!isAvailabe}>{btnText}</button>
      </li>
    )
  }
})


var NotFound = React.createClass({
  render: function(){
    return (
      <h1> Can not touch </h1>
    )
  }
})
// Routes
var routes = (
  <Router history={browserHistory}>
    <Route path='/' component={StorePiker}/>
    <Route path='/:lang/:storeId' component={App}/>
    <Route path='*' component={NotFound}/>
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'))

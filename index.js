(function () {

  //   write your code here
  //variables  
  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
  const INDEX_URL = BASE_URL + '/api/v1/users'
  const ITEM_PER_PAGE = 20
  const data = []

  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const favoritePanel = document.getElementById('favorite')
  const homePanel = document.getElementById('home')

  localStorage.setItem('showType', 'Home')
  localStorage.setItem('page', '1')

  axios.get(INDEX_URL)
    .then((response) => {
      data.push(...response.data.results)
      console.log(data)
      displayDataList(data)
      getTotalPages(data)
      getPageData(1, data)
    }).catch((err) => console.log(err))

  //Listener 
  //change to homepage
  homePanel.addEventListener('click', event => {
    console.log(data)
    localStorage.setItem('showType', 'Home')
    displayDataList(data)
    getTotalPages(data)
    getPageData(1, data)
  })

  //change to favorite page
  favoritePanel.addEventListener('click', event => {
    const friendsData = JSON.parse(localStorage.getItem('favoriteFriends')) || []
    localStorage.setItem('showType', 'Favorite')
    displayFavoriteList(friendsData)
    getTotalPages(friendsData)
    getPageData(1, friendsData)
  })

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    console.log(event.target)

    if (event.target.matches('.card-img-top')) {
      showfriend(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    } else if (event.target.matches('.btn-remove-favorite')) {
      removeFavoriteItem(event.target.dataset.id)
    }
  })

  //listen to search form submit event
  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    const list = localStorage.getItem('showType')
    let results = [];

    const regex = new RegExp(searchInput.value, 'i')

    if (list == "Home") {
      results = data.filter(friend => friend.name.match(regex))
      getTotalPages(results)
      getPageData(1, results)
    } else if (list == "Favorite") {
      const friendsData = JSON.parse(localStorage.getItem('favoriteFriends')) || []
      console.log(friendsData)
      results = friendsData.filter(friend => friend.name.match(regex))
      getTotalPages(results)
      getPageData(1, results)
    }
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      const pageNumber = event.target.dataset.page
      localStorage.setItem('page', pageNumber)
      const pagenow = localStorage.getItem('page')
      getPageData(pagenow)
    }
  })


  //functions
  //display all friends
  function displayDataList(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
        <div class="col-sm-4 col-lg-3">
          <div class="card mb-2">
            <a href="#">
              <img class="card-img-top" src="${item.avatar}" alt="Card image cap"  data-toggle="modal" data-target="#show-friend-modal" data-id="${item.id}">
            </a>
            <h6 class="card-title">${item.name}</h6>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
        `
    })
    dataPanel.innerHTML = htmlContent
  }

  //display favorite friends
  function displayFavoriteList(data) {
    let favoriteContent = ''
    data.forEach(function (item, index) {
      favoriteContent += `
        <div class="col-sm-4 col-lg-3">
          <div class="card mb-2">
            <a href="#">
            <img class="card-img-top" src="${item.avatar}" alt="Card image cap"  data-toggle="modal" data-target="#show-friend-modal" data-id="${item.id}">
            </a>
            <h6 class="card-title">${item.name}</h6>
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = favoriteContent
  }

  //show detail information of the friend
  function showfriend(id) {
    // get elements
    const modalName = document.getElementById('show-friend-name')
    const modalImage = document.getElementById('show-friend-image')
    const modalDescription = document.getElementById('show-friend-description')

    // set request url
    const url = INDEX_URL + `/${id}`

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data

      // insert data into modal ui
      modalName.textContent = data.name
      modalImage.innerHTML = `<img src="${data.avatar}" class="img-fluid" alt="Responsive image">`
      modalDescription.innerHTML = `
        Name：${data.name} ${data.surname}<br/>
        Gender：${data.gender}<br/>
        Age：${data.age}<br/>
        Birthday：${data.birthday}<br/>
        Region：${data.region}<br/>
        Email：${data.email}
      `
    })
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }


  function getPageData(pageNum, data) {
    const list = localStorage.getItem('showType')
    const pagination = document.getElementById('pagination')
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    if (list == "Home") {
      displayDataList(pageData)
    } else if (list == "Favorite") {
      displayFavoriteList(pageData)
    }
  }

  //add friends to favorite
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
    const friends = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${friends.name} is already in your favorite list.`)
    } else {
      list.push(friends)
      alert(`Added ${friends.name} to your favorite list!`)
    }
    //save to localStorage
    localStorage.setItem('favoriteFriends', JSON.stringify(list))
  }

  //remove favorie friends
  function removeFavoriteItem(id) {
    // find friend by id
    const friendsData = JSON.parse(localStorage.getItem('favoriteFriends')) || []
    const index = friendsData.findIndex(item => item.id === Number(id))
    if (index === -1) return

    // removie movie and update localStorage
    friendsData.splice(index, 1)
    localStorage.setItem('favoriteFriends', JSON.stringify(friendsData))

    // repaint dataList
    const newFriendsData = JSON.parse(localStorage.getItem('favoriteFriends')) || []
    const pagenow = localStorage.getItem('page')
    displayFavoriteList(newFriendsData)
    getTotalPages(newFriendsData)
    getPageData(pagenow, newFriendsData)
  }
})()
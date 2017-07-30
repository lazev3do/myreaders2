import React from 'react'
import * as BooksAPI from './BooksAPI'
import { Route, withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './App.css'
import Shelf from './Shelf'
import Book from './Book'

class BooksApp extends React.Component {

  //used to get query parameters from shareable search URl i.e: /search?query=android
  // taken from stackoverflow
  static getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    let params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

  state = {
    shelves: new Map(),//a map is used instead of an object
    query: '',
    searchResults:[]
  }

  //used to match shelfed books with search results
  shelfedBooksById = new Map();
  searchTimeout = -1;//used to better handle when a search is triggered

  componentDidMount() {
    BooksAPI.getAll().then((books)=>{
      const shelves = new Map([
        ["currentlyReading",{name:"Currenty Reading",books:[]}],
        ["wantToRead",{name:"Want to Read",books:[]}],
        ["read",{name:"Read",books:[]}]
      ]);
      books.forEach(book=>{
        let shelf = shelves.get(book.shelf);
        if(typeof shelf==='undefined')//just in case we get a shelf different from the ones above
        {
          shelf = {name:book.shelf,books:[]};
          shelves.set(shelf.name,shelf);
        }
        shelf.books.push(book);
      });
      this.setState((state)=>(
        {shelves:shelves,searchResults:state.searchResults}
      ));
      this.refreshShelfedBooksById();//everytime there is a change to the shelves the map shelfedBooksById book_id->book is updated
    });
    this.search(BooksApp.getQueryParams(this.props.location.search)['query'] || '');
  }

  /**
  * @description Client side moving books from one shelf to another
  **/
  moveFromShelfToShelf = (book,oldShelfName,newShelfName) => {
    const shelves =  this.state.shelves;
    const oldShelf = shelves.get(oldShelfName);
    const newShelf =  shelves.get(newShelfName);
    if(typeof oldShelf!=='undefined')
    {
      for(let i = 0;i<oldShelf.books.length;i++)
      {
        if(oldShelf.books[i].id === book.id)
        {
          oldShelf.books.splice(i,1);
        }
      }
    }
    book.shelf=newShelfName;
    if(newShelf)
      newShelf.books.push(book);
    this.refreshShelfedBooksById();
    this.setState({shelves});
  }

  update = (book,shelf)=>{
    //updating server side
    const originalShelf = book.shelf;
    const destinationShelf = shelf;
    const book_copy =  Object.assign({}, book);//otherwise: Cannot assign to read only property 'shelf' of object '#<Object>'
    BooksAPI.update(book,shelf).catch(error=>{ //in case there is an error updating the server the client side changes are rolled-back
      alert("Error while fetching from server, rolling back changes");
      this.moveFromShelfToShelf(book_copy,destinationShelf,originalShelf);
    });
    this.moveFromShelfToShelf(book_copy,originalShelf,destinationShelf);
  };
  //maintanes the Map which connects the shelfed Books' IDs so before a render we can set the correct shelf
  refreshShelfedBooksById(){
    for (var [shelf, shelfedBooks] of this.state.shelves.entries()) {
      shelfedBooks.books.forEach(shelfedBook=>{
        this.shelfedBooksById.set(shelfedBook.id,shelfedBook);
      });
    }
  }
  /**
  * @description Searches for books when the search field isn't changed for half a second instead of fireing several
  * search requests.
  * Also changes the URL GET Parameters so the search is shareable
  **/
  search = (query)=>{
    this.setState({query});
    if(query)
    {
      if(this.searchTimeout>-1)
        clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(()=>{
        this.props.history.push(`/search?query=${query}`)
        BooksAPI.search(query,20).then(searchResults=>{
          if(typeof searchResults.error==='undefined')
          {
            this.setState({searchResults});
          }
        });
      },500);
    }
  }
  render() {
    const {shelves,searchResults} = this.state;
    const {query} = this.state;
    const searchResultsToShow = [];
    searchResults.forEach(book => {
      let shelfedBook = this.shelfedBooksById.get(book.id);
      if(typeof shelfedBook!=='undefined')
      {
        book.shelf=shelfedBook.shelf;
      }
      else {
        book.shelf="none"; //some of the books were being returned by the search method as already being assigned to a shelf
      }
      searchResultsToShow.push(book);
    });
    return (
      <div>
        <Route exact path="/search" render={()=>(
          <div className="search-books">
            <div className="search-books-bar">
              <Link to="/" className="close-search">Close</Link>
              <div className="search-books-input-wrapper">
                <input type="text" onChange={event=>this.search(event.target.value)} value={query} placeholder="Search by title or author"/>
              </div>
            </div>
            <div className="search-books-results">
              <ol className="books-grid"></ol>
            </div>
          </div>
        )}/>
        <div className="list-books">
        <Route exact path="/" render={()=>(
          <div className="list-books-title">
            <h1>MyReads</h1>
          </div>
        )}/>
        <div className="list-books-content">
          <Route exact path="/" render={()=>(
            <div>
              {
                Array.from(shelves).map(entry=>(
                  <Shelf onShelfChanged={this.update} shelves={shelves} key={entry[0]} name={entry[1].name} books={entry[1].books} />
                ))
              }
            </div>
          )}/>
        <Route exact path="/search" render={()=>(
          <div>
            <ol className="books-grid">
            {
              searchResults.map((book,index)=>(
              <li key={`li_${book.id}_${index}`}>
                <Book onShelfChanged={this.update} shelves={shelves} key={`book_${book.id}_${index}`} {...book} />
              </li>
            ))}
            </ol>
          </div>
        )}/>
        </div>
        <div className="open-search">
          <Link to="/search">Add a book</Link>
        </div>
      </div>
    </div>
    )
  }
}

//using the withRouter it's possible to access the history prop whenever I need it in the code
export default withRouter(BooksApp)

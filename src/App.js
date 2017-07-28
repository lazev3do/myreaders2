import React from 'react'
import * as BooksAPI from './BooksAPI'
import { Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './App.css'
import Shelf from './shelf.js'
import Book from './Book.js'

class BooksApp extends React.Component {
  state = {
    shelves: new Map(),//a map is used instead of an object
    query: '',
    searchResults:[]
  }

  //used to match shelfed books with search results
  shelfedBooksById = new Map();
  searchTimeout = -1;

  componentDidMount() {
    BooksAPI.getAll().then((books)=>{
      let shelves = new Map([
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
      this.setState({shelves});
      this.refreshShelfedBooksById();//everytime there is a change to the shelves the map shelfedBooksById book_id->book is updated
    });
  }

  moveFromShelfToShelf = (book,oldShelfName,newShelfName) => {
    let shelves =  this.state.shelves;
    let oldShelf = shelves.get(oldShelfName);
    let newShelf =  shelves.get(newShelfName);
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
    newShelf.books.push(book);
    this.refreshShelfedBooksById();
    this.setState({shelves});
  }

  update = (book,shelf)=>{
    //updating server side
    let originalShelf = book.shelf;
    let destinationShelf = shelf;
    const book_copy =  Object.assign({}, book);//otherwise: Cannot assign to read only property 'shelf' of object '#<Object>'
    BooksAPI.update(book,shelf).catch(error=>{ //in case there is an error updating the server the client side changeds are rolled-back
      alert("Error while fetching from server, rolling back changes");
      this.moveFromShelfToShelf(book_copy,destinationShelf,originalShelf);
    });
    this.moveFromShelfToShelf(book_copy,originalShelf,destinationShelf);
  };

  refreshShelfedBooksById(){
    for (var [shelf, shelfedBooks] of this.state.shelves.entries()) {
      shelfedBooks.books.forEach(shelfedBook=>{
        this.shelfedBooksById.set(shelfedBook.id,shelfedBook);
      });
    }
  }

  search = (query)=>{
    this.setState({query});
    if(this.state.query)
    {
      if(this.searchTimeout>-1)
        clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(()=>{
        BooksAPI.search(query,20).then(searchResults=>{
          if(typeof searchResults.error==='undefined')
          {
            history.push({
              pathname: '/search',
              search: '?query='+query
            })
            this.setState({searchResults});
          }
        });
      },500);
    }
  }
  /**
  TODO: add URL history so it's sharable and add a input check timeout so we have less http requests
  **/
  render() {
    const {shelves,searchResults} = this.state;
    let {query} = this.state;
    let searchResultsToShow = [];
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

export default BooksApp

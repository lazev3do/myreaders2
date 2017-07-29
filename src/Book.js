import React from 'react';
import PropTypes from 'prop-types';
import BookShelfChanger from './BookShelfChanger'

/**
* A Book doesn't need any state ,as such it's a Stateless Functional Component
**/
function Book(props) {

  const {imageLinks,  authors, title, shelves, shelf,onShelfChanged} = props;

  return (
    <div className="book">
      <div className="book-top">
        <div className="book-cover" style={{ width: 128, height: 193, backgroundImage: `url("${imageLinks.smallThumbnail}")` }}></div>
        <BookShelfChanger book={props} onShelfChanged={onShelfChanged} shelves={shelves} shelf={shelf} />
    </div>
      <div className="book-title">{title}</div>
      {authors.map((author,index)=>(
        <div key={`author_${index}`} className="book-authors">{author}</div>
      ))}
    </div>
  )
}

Book.propTypes = {
  authors: PropTypes.array,
  id: PropTypes.string.isRequired,
  title:PropTypes.string.isRequired,
  imageLinks:PropTypes.object.isRequired,
  shelves:PropTypes.object.isRequired,
  shelf:PropTypes.string.isRequired,
  onShelfChanged:PropTypes.func.isRequired
}
//some of the books returned by the search didn't have these fields set
Book.defaultProps = {
  authors:[],
  imageLinks:{smallThumbnail:"http://i.imgur.com/sJ3CT4V.gif"}
}

export default Book;

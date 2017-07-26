import React from 'react';
import PropTypes from 'prop-types';
import BookShelfChanger from './bookshelfchanger'

function Book(props) {

  let {imageLinks,  authors, title, shelves, shelf,onShelfChanged} = props;

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
  authors: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  title:PropTypes.string.isRequired,
  imageLinks:PropTypes.object.isRequired,
  shelves:PropTypes.object.isRequired,
  shelf:PropTypes.string.isRequired,
  onShelfChanged:PropTypes.func.isRequired
}

export default Book;

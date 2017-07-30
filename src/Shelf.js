import React,{Component} from 'react'
import PropTypes from 'prop-types'
import Book from './Book'

class Shelf extends Component {
  static propTypes = {
    books:PropTypes.array.isRequired,
    name:PropTypes.string.isRequired,
    shelves: PropTypes.object.isRequired,
    onShelfChanged:PropTypes.func.isRequired
  }

  state = {
    books:this.props.books
  }

  render(){
    const {name,shelves,onShelfChanged}  = this.props;
    const {books} = this.state;
    return(
      <div className="bookshelf">
        <h2 className="bookshelf-title">{name}</h2>
        <div className="bookshelf-books">
          <ol className="books-grid">
          {books.map((book,index)=>(
            <li key={book.id}>
              <Book onShelfChanged={onShelfChanged} shelves={shelves} key={`book_${book.id}`} {...book} />
            </li>
          ))}
          </ol>
        </div>
      </div>
    )
  }
}

export default Shelf;

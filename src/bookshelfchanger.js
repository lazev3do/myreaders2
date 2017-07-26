import React, {Component} from 'react';
import PropTypes from 'prop-types';

class BookShelfChanger extends Component {

  static propTypes = {
    shelf: PropTypes.string.isRequired,
    shelves: PropTypes.object.isRequired,
    onShelfChanged: PropTypes.func.isRequired,
    book: PropTypes.object.isRequired
  };
  state = {
    currentShelf : this.props.shelf
  }

  render() {
    let {shelves,shelf,onShelfChanged,book} = this.props;
    let {currentShelf} = this.state;
    let presentShelfName = shelves.get(currentShelf);
    return (
        <div className="book-shelf-changer">
        <select defaultValue={shelf} onChange={(event)=>onShelfChanged(book,event.target.value)}>
          <option value="none" disabled>Move to...</option>
          {
            Array.from(shelves.keys()).map((shelfName,index) => (
              <option key={`option_${index}`} value={shelfName}>{shelves.get(shelfName).name}</option>
            ))
          }
        </select>
      </div>
    )
  }
}

export default BookShelfChanger;

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

  shelfChanged = (event) =>{
    const {onShelfChanged,book} = this.props;
    this.setState({currentShelf:event.target.value});
    onShelfChanged(book,event.target.value);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.shelf!==this.state.currentShelf)//when an update fales the boolShelfChanged is created with new props using the shelf info before the updated was tried
    {
      this.setState({currentShelf:nextProps.shelf});
    }
  }

  render() {
    const {shelves} = this.props;
    const {currentShelf} = this.state;
    return (
        <div className="book-shelf-changer">
        <select value={currentShelf} onChange={(event)=>this.shelfChanged(event)}>
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

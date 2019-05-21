import React, {Component} from 'react';
import {render} from 'react-dom';
import Head from 'next/head'
import { arrayMove, SortableContainer, SortableElement } from "react-sortable-hoc";
import gridItem from './section/gridItem'
import names from '../static/js/names.js'

const ROW_HEIGHT = 30;


const SortableItem = SortableElement(({ value }) => {
  return <li>{value}</li>;
});

const SortableList = SortableContainer(({ items }) => {
  return (
    <ul>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </ul>
  );
});


class SortableComponent extends Component {
  state = {
    items: [
      "Item 1",
      "Item 2",
      "Item 3",
      "Item 4",
      "Item 5",
      "Item 6",
      "Item 1",
      "Item 2",
      "Item 3",
      "Item 4",
      "Item 5",
      "Item 6"
    ]
  };

	onSortEnd = ({ oldIndex, newIndex }) => {
	    this.setState(({ items }) => ({
	      items: arrayMove(items, oldIndex, newIndex)
	    }));
	  };

  render() {
    return (
      <React.Fragment>
      	<Head>
      	  <title>My styled page</title>
      	  <link href="/static/grid.css" rel="stylesheet" />
      	</Head>

      	<div>
      		<names />
      	        <SortableList
      	          axis="xy"
      	          items={this.state.items}
      	          onSortEnd={this.onSortEnd}
      	        />
	      </div>
      </React.Fragment>
    );
  }
}

export default SortableComponent;

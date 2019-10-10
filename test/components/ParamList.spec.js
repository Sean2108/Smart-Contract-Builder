import { spy } from 'sinon';
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { BrowserRouter as Router } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { createMount } from '@material-ui/core/test-utils';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ParamList from '../../app/components/build/ParamList';
import { TextField, Select } from '@material-ui/core';

Enzyme.configure({ adapter: new Adapter() });

function setup() {
  const onchange = jest.fn();
  const component = createMount()(
    <ParamList
      updateParams={onchange}
      params={[
        { type: 'uint', displayName: 'invalid', value: '' },
        { type: 'uint', name: 'invalid', value: '' },
        { type: 'string', name: 'str', displayName: 'str', value: 'teststr' },
        { type: 'uint', name: 'int', displayName: 'int', value: '42' },
        { type: 'bool', name: 'boolean', displayName: 'boolean', value: 'true' }
      ]}
      tooltipText="test tooltip"
      header="test header"
    />
  );
  const textRows = component.find(TextField);
  const selectRow = component.find(Select);
  return { component, textRows, selectRow, onchange };
}

describe('ParamList component', () => {
  it('initial state should be correct', () => {
    const { component, textRows, selectRow } = setup();
    const header = component.find(Typography);
    const tooltip = component.find(Tooltip);
    expect(header.text()).toBe('test header');
    expect(tooltip.props().title).toBe('test tooltip');
    expect(textRows).toHaveLength(2);
    expect(selectRow).toHaveLength(1);
    expect(textRows.at(0).props().value).toBe('teststr');
    expect(textRows.at(1).props().value).toBe('42');
    expect(selectRow.props().value).toBe('true');
  });

  it(' should result in correct function call when str text box value is changed', () => {
    const { textRows, onchange } = setup();
    textRows
      .at(0)
      .props()
      .onChange({ target: { value: 'newstr' } });
    const newParams = [
      { type: 'string', name: 'str', displayName: 'str', value: 'newstr' },
      { type: 'uint', name: 'int', displayName: 'int', value: '42' },
      { type: 'bool', name: 'boolean', displayName: 'boolean', value: 'true' }
    ];
    expect(onchange).toHaveBeenCalledWith(newParams);
  });

  it(' should result in correct function call when int text box value is changed', () => {
    const { textRows, onchange } = setup();
    textRows
      .at(1)
      .props()
      .onChange({ target: { value: '1' } });
    const newParams = [
      { type: 'string', name: 'str', displayName: 'str', value: 'teststr' },
      { type: 'uint', name: 'int', displayName: 'int', value: '1' },
      { type: 'bool', name: 'boolean', displayName: 'boolean', value: 'true' }
    ];
    expect(onchange).toHaveBeenCalledWith(newParams);
  });

  it(' should result in correct function call when bool select value is changed', () => {
    const { selectRow, onchange } = setup();
    selectRow.props().onChange({ target: { value: 'false' } });
    const newParams = [
      { type: 'string', name: 'str', displayName: 'str', value: 'teststr' },
      { type: 'uint', name: 'int', displayName: 'int', value: '42' },
      { type: 'bool', name: 'boolean', displayName: 'boolean', value: 'false' }
    ];
    expect(onchange).toHaveBeenCalledWith(newParams);
  });
});

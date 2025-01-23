import React from 'react';
import Select from 'react-select';

const ApparatusSelect = ({ options, onChange }) => {
  const formattedOptions = options.map(option => ({
    value: option,
    label: option
  }));

  return (
    <Select
      options={formattedOptions}
      onChange={onChange}
      placeholder="Select an apparatus..."
      style={{margin: "0 15px"}}
    />
  );
};

export default ApparatusSelect;
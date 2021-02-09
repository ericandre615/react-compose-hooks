import React, { useState, useEffect, useContext } from 'react';
import { render, waitFor } from '@testing-library/react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import compose from '../compose';

const TestComponent = props => {
  return (
    <div id="test">
      <p>Tests work with props { props.text }</p>
    </div>
  );
};

describe('compose hooks', () => {
  it('should call hook with props and pass to component as props', () => {
    const useTestHook = ({ text }) => ({ helloText: `Hello, I say, ${text}` });
    const TestComponent = ({ helloText }) => (<p id="test-text">{ helloText }</p>);
    const Composed = compose(useTestHook)(TestComponent);
    const Mounted = mount(<Composed text="testing" />);
    const Text = Mounted.find('#test-text');
    const expectedText = 'Hello, I say, testing';

    expect(Text.exists()).toBe(true);
    expect(Text.text()).toEqual(expectedText);
  });

  it('should call multiple hooks with props and results from previous hooks', () => {
    const useOne = () => ({ a: 4 });
    const useTwo = () => ({ b: 2 });
    const useAdd = ({ a, b }) => ({ sum: a + b });
    const TestComponent = ({ a, b, sum }) => (
      <div>
        <p id="a">{ a }</p><p>+</p><p id="b">{ b }</p><p>=</p><p id="sum">{ sum }</p>
      </div>
    );
    const Composed = compose(useOne, useTwo, useAdd)(TestComponent);
    const Mounted = mount(<Composed />);
    const expectedProps = { a: 4, b: 2, sum: 6 };

    const A = Mounted.find('#a');
    const B = Mounted.find('#b');
    const Sum = Mounted.find('#sum');

    expect(A.text()).toEqual('4');
    expect(B.text()).toEqual('2');
    expect(Sum.text()).toEqual('6');
  });

  it('should work with useState hook', () => {
    const defaultPerson = { name: '', age: 0, hobbies: [] };
    const usePerson = () => {
      const [person, updatePerson] = useState(defaultPerson);

      return ({ person, updatePerson });
    };
    const useFirstName = () => ({ firstName: 'Jeremy' });
    const useLastName = () => ({ lastName: 'Pivens' });
    const useAge = () => ({ age: 32 });
    const useFullName = ({ firstName, lastName }) => ({ fullName: `Sir ${firstName} ${lastName}` });
    const useFullPerson = ({ person, updatePerson, fullName, age }) => {
      if (person.age <= 0) {
        updatePerson({ ...person, name: fullName, age, hobbies: ['testing', 'working'] });
      }
    };
    const TestComponent = ({ person, message }) => (
      <div id="person">
        <p id="person-message">{ message }</p>
        <ul id="person-details">
          <li className="detail" id="name">{ person.name }</li>
          <li className="detail" id="age">{ person.age }</li>
          <li className="detail" id="hobbies">
            <ul>
              {
                person.hobbies.map(hobby => (
                  <li className="hobby" key={ hobby }>
                    { hobby }
                  </li>
                ))
              }
            </ul>
          </li>
        </ul>
      </div>
    );
    const Compose = compose(
      useFirstName,
      useLastName,
      useAge,
      usePerson,
      useFullName,
      useFullPerson,
    )(TestComponent);
    const Mounted = mount(<Compose message="A testing tester" />);

    const PersonFullName = Mounted.find('#name');
    const PersonAge = Mounted.find('#age');
    const PersonHobbies = Mounted.find('#hobbies');
    const HobbiesList = Mounted.find('.hobby');
    const HobbiesItems = HobbiesList.map(x => x);

    expect(PersonFullName.text()).toEqual('Sir Jeremy Pivens');
    expect(PersonAge.text()).toEqual('32');
    expect(PersonHobbies.exists()).toBe(true);
    expect(HobbiesList.length).toBe(2);
    expect(HobbiesItems[0].text()).toEqual('testing');
    expect(HobbiesItems[1].text()).toEqual('working');
  });

  it('should use function name when hook return value is not an object', () => {
    const setSomething = id => id;
    const something = { text: 'using something' };
    const useTestHook = () => ([something, setSomething]);
    const TestComponent = ({ useTestHook: [something, setSomething] }) => {
      const canCallSomething = setSomething('something was set');

      return (
        <div id="test">
          <p id="something">{ something.text }</p>
          <p id="called">{ canCallSomething }</p>
        </div>
      );
    };
    const Composed = compose(useTestHook)(TestComponent);
    const Mounted = mount(<Composed />);
    const Something = Mounted.find('#something');
    const Called = Mounted.find('#called');
    const expectedSomething = 'using something';
    const expectedCalled = 'something was set';

    expect(Something.text()).toEqual(expectedSomething);
    expect(Called.text()).toEqual(expectedCalled);
  });

  it('should work with useEffect', () => {
    const mockFetch = () => new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ data: 'fetched' });
      }, 20);
    });
    const useTestHook = () => {
      const [data, setData] = useState('');
      useEffect(() => {
        mockFetch().then(response => {
          setData(response.data);
        });
      }, []);

      return ({ data });
    };
    const TestComponent = ({ data }) => (
      <p id="test">{ data }</p>
    );
    const expectedData = 'fetched';
    const Composed = compose(useTestHook)(TestComponent);
    const { container } = render(<Composed />);

    const testData = container.children[0];

    return waitFor(() => {
      expect(testData.textContent).toEqual(expectedData);
    });
  });

  it('should work with useContext', () => {
    const TestContext = React.createContext();
    const TestComponent = ({ conText }) => (<p id="test">{ conText }</p>);
    const useTestHook = () => ({
      conText: useContext(TestContext),
    });
    const Composed = compose(useTestHook)(TestComponent);
    const MountedContext = mount(
      <TestContext.Provider value="I am context">
        <Composed />
      </TestContext.Provider>
    );
    const ContextText = MountedContext.find('#test');

    expect(ContextText.text()).toEqual('I am context');
  });

  it('should return Component if no hooks present', () => {
    const TestComponent = ({ text }) => (<p id="test">No Hooks, { text }</p>);
    const Composed = compose()(TestComponent);
    const Mounted = mount(<Composed text="here" />);
    const Test = Mounted.find('#test');

    expect(Test.text()).toEqual('No Hooks, here');
  });
});

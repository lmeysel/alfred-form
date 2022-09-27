import { defineComponent } from 'vue';
import { useFormElement, withFormElementProps } from '../../../src/alfred-form';

export default defineComponent({
  props: { ...withFormElementProps() },
  setup(props) {
    const { field } = useFormElement(props);

    return () => (
      <>
        <label>{field.label}</label>
        <input
          type="text"
          value={field.value}
          onChange={({ target }) => (field.value = (target as HTMLInputElement).value)}
        />
        {field.error && <small style="color:red">{field.error}</small>}
      </>
    );
  },
});

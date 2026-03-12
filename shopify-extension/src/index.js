import {
  extend,
  BlockStack,
  InlineStack,
  TextField,
  Checkbox,
  Button,
  TextBlock,
} from '@shopify/customer-account-ui-extensions';

const MIDDLEWARE_URL = 'https://your-cloud-run-url/submit-wholesale';

extend('customer-account.page.render', (root, api) => {
  renderForm(root, api);
});

extend('customer-account.order.action.menu-item.render', (root, api) => {
  renderForm(root, api);
});

function renderForm(root, api) {
  let formData = {
    firmName: '',
    businessType: '',
    yearsInBusiness: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    website: '',
    instagramHandle: '',
    businessAddress: '',
    businessAddress2: '',
    city: '',
    state: '',
    zipCode: '',
    isTaxExempt: false,
    taxId: '',
    marketingOptIn: false,
    smsConsent: false,
    termsAccepted: false,
    receivedSampleSet: false
  };

  const updateField = (key, value) => {
    formData[key] = value;
  };

  const formContainer = root.createComponent(BlockStack, { spacing: 'loose' });
  const title = root.createComponent(TextBlock, { size: 'extraLarge', appearance: 'accent' }, 'UnderItAll Wholesale Application');
  formContainer.appendChild(title);

  const fields = [
    { key: 'firmName', label: 'Firm Name' },
    { key: 'businessType', label: 'Business Type' },
    { key: 'yearsInBusiness', label: 'Years in Business', type: 'number' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'telephone' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'instagramHandle', label: 'Instagram Handle' },
    { key: 'businessAddress', label: 'Business Address' },
    { key: 'businessAddress2', label: 'Business Address 2' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zipCode', label: 'Zip Code' },
    { key: 'taxId', label: 'Tax ID' }
  ];

  fields.forEach(field => {
    const textField = root.createComponent(TextField, {
      label: field.label,
      type: field.type || 'text',
      onChange: (value) => updateField(field.key, value)
    });
    formContainer.appendChild(textField);
  });

  const checkboxes = [
    { key: 'isTaxExempt', label: 'Is Tax Exempt?' },
    { key: 'marketingOptIn', label: 'Marketing Opt-In' },
    { key: 'smsConsent', label: 'SMS Consent' },
    { key: 'termsAccepted', label: 'Terms Accepted' },
    { key: 'receivedSampleSet', label: 'Received Sample Set' }
  ];

  checkboxes.forEach(cb => {
    const checkbox = root.createComponent(Checkbox, {
      onChange: (value) => updateField(cb.key, value)
    }, cb.label);
    formContainer.appendChild(checkbox);
  });

  const messageBlock = root.createComponent(TextBlock, { appearance: 'critical' }, '');
  
  const submitButton = root.createComponent(Button, {
    kind: 'primary',
    onPress: async () => {
      submitButton.updateProps({ loading: true });
      messageBlock.updateProps({ text: '' });
      
      try {
        const response = await fetch(MIDDLEWARE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          formContainer.replaceChildren(
            root.createComponent(TextBlock, { appearance: 'success', size: 'large' }, 'Application Submitted Successfully!')
          );
        } else {
          const errorData = await response.json();
          messageBlock.updateProps({ text: `Error: ${errorData.details || 'Submission failed'}` });
          submitButton.updateProps({ loading: false });
        }
      } catch (error) {
        messageBlock.updateProps({ text: `Network Error: ${error.message}` });
        submitButton.updateProps({ loading: false });
      }
    }
  }, 'Submit Application');

  formContainer.appendChild(messageBlock);
  formContainer.appendChild(submitButton);

  root.appendChild(formContainer);
}

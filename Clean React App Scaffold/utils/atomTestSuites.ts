/**
 * Comprehensive test suites for all atom components
 * Validates prop→className mapping and contract consistency
 */

import { AtomTestSuite } from './testing';

export const BUTTON_TEST_SUITE: AtomTestSuite = {
  component: 'Button',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-button atom-button--primary atom-button--md',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'primary',
        'data-size': 'md',
        'data-disabled': 'false'
      },
      description: 'Default button (primary, medium)'
    },
    {
      props: { variant: 'secondary' },
      expectedClassName: 'atom-button atom-button--secondary atom-button--md',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'secondary',
        'data-size': 'md',
        'data-disabled': 'false'
      },
      description: 'Secondary button variant'
    },
    {
      props: { variant: 'ghost' },
      expectedClassName: 'atom-button atom-button--ghost atom-button--md',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'ghost',
        'data-size': 'md',
        'data-disabled': 'false'
      },
      description: 'Ghost button variant'
    },
    {
      props: { variant: 'destructive' },
      expectedClassName: 'atom-button atom-button--destructive atom-button--md',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'destructive',
        'data-size': 'md',
        'data-disabled': 'false'
      },
      description: 'Destructive button variant'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-button atom-button--primary atom-button--sm',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'primary',
        'data-size': 'sm',
        'data-disabled': 'false'
      },
      description: 'Small button size'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-button atom-button--primary atom-button--lg',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'primary',
        'data-size': 'lg',
        'data-disabled': 'false'
      },
      description: 'Large button size'
    },
    {
      props: { disabled: true },
      expectedClassName: 'atom-button atom-button--primary atom-button--md',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'primary',
        'data-size': 'md',
        'data-disabled': 'true'
      },
      description: 'Disabled button'
    },
    {
      props: { variant: 'secondary', size: 'sm', disabled: true },
      expectedClassName: 'atom-button atom-button--secondary atom-button--sm',
      expectedDataAttributes: {
        'data-atom': 'button',
        'data-variant': 'secondary',
        'data-size': 'sm',
        'data-disabled': 'true'
      },
      description: 'Secondary small disabled button (combination)'
    }
  ]
};

export const INPUT_TEST_SUITE: AtomTestSuite = {
  component: 'Input',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-input atom-input--md',
      expectedDataAttributes: {
        'data-atom': 'input',
        'data-size': 'md',
        'data-state': 'default',
        'data-disabled': 'false'
      },
      description: 'Default input'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-input atom-input--sm',
      expectedDataAttributes: {
        'data-atom': 'input',
        'data-size': 'sm',
        'data-state': 'default',
        'data-disabled': 'false'
      },
      description: 'Small input'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-input atom-input--lg',
      expectedDataAttributes: {
        'data-atom': 'input',
        'data-size': 'lg',
        'data-state': 'default',
        'data-disabled': 'false'
      },
      description: 'Large input'
    },
    {
      props: { state: 'error' },
      expectedClassName: 'atom-input atom-input--md atom-input--error',
      expectedDataAttributes: {
        'data-atom': 'input',
        'data-size': 'md',
        'data-state': 'error',
        'data-disabled': 'false'
      },
      description: 'Input with error state'
    },
    {
      props: { state: 'success' },
      expectedClassName: 'atom-input atom-input--md atom-input--success',
      expectedDataAttributes: {
        'data-atom': 'input',
        'data-size': 'md',
        'data-state': 'success',
        'data-disabled': 'false'
      },
      description: 'Input with success state'
    },
    {
      props: { disabled: true },
      expectedClassName: 'atom-input atom-input--md',
      expectedDataAttributes: {
        'data-atom': 'input',
        'data-size': 'md',
        'data-state': 'default',
        'data-disabled': 'true'
      },
      description: 'Disabled input'
    }
  ]
};

export const CHECKBOX_TEST_SUITE: AtomTestSuite = {
  component: 'Checkbox',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-checkbox atom-checkbox--md',
      expectedDataAttributes: {
        'data-atom': 'checkbox',
        'data-size': 'md',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Default checkbox'
    },
    {
      props: { checked: true },
      expectedClassName: 'atom-checkbox atom-checkbox--md atom-checkbox--checked',
      expectedDataAttributes: {
        'data-atom': 'checkbox',
        'data-size': 'md',
        'data-checked': 'true',
        'data-disabled': 'false'
      },
      description: 'Checked checkbox'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-checkbox atom-checkbox--sm',
      expectedDataAttributes: {
        'data-atom': 'checkbox',
        'data-size': 'sm',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Small checkbox'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-checkbox atom-checkbox--lg',
      expectedDataAttributes: {
        'data-atom': 'checkbox',
        'data-size': 'lg',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Large checkbox'
    },
    {
      props: { disabled: true },
      expectedClassName: 'atom-checkbox atom-checkbox--md',
      expectedDataAttributes: {
        'data-atom': 'checkbox',
        'data-size': 'md',
        'data-checked': 'false',
        'data-disabled': 'true'
      },
      description: 'Disabled checkbox'
    }
  ]
};

export const CHIP_TEST_SUITE: AtomTestSuite = {
  component: 'Chip',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-chip atom-chip--neutral atom-chip--md',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'neutral',
        'data-size': 'md',
        'data-interactive': 'false'
      },
      description: 'Default chip'
    },
    {
      props: { variant: 'success' },
      expectedClassName: 'atom-chip atom-chip--success atom-chip--md',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'success',
        'data-size': 'md',
        'data-interactive': 'false'
      },
      description: 'Success chip variant'
    },
    {
      props: { variant: 'error' },
      expectedClassName: 'atom-chip atom-chip--error atom-chip--md',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'error',
        'data-size': 'md',
        'data-interactive': 'false'
      },
      description: 'Error chip variant'
    },
    {
      props: { variant: 'warning' },
      expectedClassName: 'atom-chip atom-chip--warning atom-chip--md',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'warning',
        'data-size': 'md',
        'data-interactive': 'false'
      },
      description: 'Warning chip variant'
    },
    {
      props: { variant: 'info' },
      expectedClassName: 'atom-chip atom-chip--info atom-chip--md',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'info',
        'data-size': 'md',
        'data-interactive': 'false'
      },
      description: 'Info chip variant'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-chip atom-chip--neutral atom-chip--sm',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'neutral',
        'data-size': 'sm',
        'data-interactive': 'false'
      },
      description: 'Small chip'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-chip atom-chip--neutral atom-chip--lg',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'neutral',
        'data-size': 'lg',
        'data-interactive': 'false'
      },
      description: 'Large chip'
    },
    {
      props: { interactive: true },
      expectedClassName: 'atom-chip atom-chip--neutral atom-chip--md atom-chip--interactive',
      expectedDataAttributes: {
        'data-atom': 'chip',
        'data-variant': 'neutral',
        'data-size': 'md',
        'data-interactive': 'true'
      },
      description: 'Interactive chip'
    }
  ]
};

export const BADGE_TEST_SUITE: AtomTestSuite = {
  component: 'Badge',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-badge atom-badge--neutral atom-badge--md',
      expectedDataAttributes: {
        'data-atom': 'badge',
        'data-variant': 'neutral',
        'data-size': 'md'
      },
      description: 'Default badge'
    },
    {
      props: { variant: 'primary' },
      expectedClassName: 'atom-badge atom-badge--primary atom-badge--md',
      expectedDataAttributes: {
        'data-atom': 'badge',
        'data-variant': 'primary',
        'data-size': 'md'
      },
      description: 'Primary badge variant'
    },
    {
      props: { variant: 'success' },
      expectedClassName: 'atom-badge atom-badge--success atom-badge--md',
      expectedDataAttributes: {
        'data-atom': 'badge',
        'data-variant': 'success',
        'data-size': 'md'
      },
      description: 'Success badge variant'
    },
    {
      props: { variant: 'error' },
      expectedClassName: 'atom-badge atom-badge--error atom-badge--md',
      expectedDataAttributes: {
        'data-atom': 'badge',
        'data-variant': 'error',
        'data-size': 'md'
      },
      description: 'Error badge variant'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-badge atom-badge--neutral atom-badge--sm',
      expectedDataAttributes: {
        'data-atom': 'badge',
        'data-variant': 'neutral',
        'data-size': 'sm'
      },
      description: 'Small badge'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-badge atom-badge--neutral atom-badge--lg',
      expectedDataAttributes: {
        'data-atom': 'badge',
        'data-variant': 'neutral',
        'data-size': 'lg'
      },
      description: 'Large badge'
    }
  ]
};

export const SELECT_TEST_SUITE: AtomTestSuite = {
  component: 'Select',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-select atom-select--md',
      expectedDataAttributes: {
        'data-atom': 'select',
        'data-size': 'md',
        'data-state': 'default',
        'data-disabled': 'false'
      },
      description: 'Default select'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-select atom-select--sm',
      expectedDataAttributes: {
        'data-atom': 'select',
        'data-size': 'sm',
        'data-state': 'default',
        'data-disabled': 'false'
      },
      description: 'Small select'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-select atom-select--lg',
      expectedDataAttributes: {
        'data-atom': 'select',
        'data-size': 'lg',
        'data-state': 'default',
        'data-disabled': 'false'
      },
      description: 'Large select'
    },
    {
      props: { state: 'error' },
      expectedClassName: 'atom-select atom-select--md atom-select--error',
      expectedDataAttributes: {
        'data-atom': 'select',
        'data-size': 'md',
        'data-state': 'error',
        'data-disabled': 'false'
      },
      description: 'Select with error state'
    },
    {
      props: { disabled: true },
      expectedClassName: 'atom-select atom-select--md',
      expectedDataAttributes: {
        'data-atom': 'select',
        'data-size': 'md',
        'data-state': 'default',
        'data-disabled': 'true'
      },
      description: 'Disabled select'
    }
  ]
};

export const SWITCH_TEST_SUITE: AtomTestSuite = {
  component: 'Switch',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-switch atom-switch--md',
      expectedDataAttributes: {
        'data-atom': 'switch',
        'data-size': 'md',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Default switch'
    },
    {
      props: { checked: true },
      expectedClassName: 'atom-switch atom-switch--md atom-switch--checked',
      expectedDataAttributes: {
        'data-atom': 'switch',
        'data-size': 'md',
        'data-checked': 'true',
        'data-disabled': 'false'
      },
      description: 'Checked switch'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-switch atom-switch--sm',
      expectedDataAttributes: {
        'data-atom': 'switch',
        'data-size': 'sm',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Small switch'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-switch atom-switch--lg',
      expectedDataAttributes: {
        'data-atom': 'switch',
        'data-size': 'lg',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Large switch'
    },
    {
      props: { disabled: true },
      expectedClassName: 'atom-switch atom-switch--md',
      expectedDataAttributes: {
        'data-atom': 'switch',
        'data-size': 'md',
        'data-checked': 'false',
        'data-disabled': 'true'
      },
      description: 'Disabled switch'
    }
  ]
};

export const RADIO_TEST_SUITE: AtomTestSuite = {
  component: 'Radio',
  testCases: [
    {
      props: {},
      expectedClassName: 'atom-radio atom-radio--md',
      expectedDataAttributes: {
        'data-atom': 'radio',
        'data-size': 'md',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Default radio button'
    },
    {
      props: { checked: true },
      expectedClassName: 'atom-radio atom-radio--md atom-radio--checked',
      expectedDataAttributes: {
        'data-atom': 'radio',
        'data-size': 'md',
        'data-checked': 'true',
        'data-disabled': 'false'
      },
      description: 'Checked radio button'
    },
    {
      props: { size: 'sm' },
      expectedClassName: 'atom-radio atom-radio--sm',
      expectedDataAttributes: {
        'data-atom': 'radio',
        'data-size': 'sm',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Small radio button'
    },
    {
      props: { size: 'lg' },
      expectedClassName: 'atom-radio atom-radio--lg',
      expectedDataAttributes: {
        'data-atom': 'radio',
        'data-size': 'lg',
        'data-checked': 'false',
        'data-disabled': 'false'
      },
      description: 'Large radio button'
    },
    {
      props: { disabled: true },
      expectedClassName: 'atom-radio atom-radio--md',
      expectedDataAttributes: {
        'data-atom': 'radio',
        'data-size': 'md',
        'data-checked': 'false',
        'data-disabled': 'true'
      },
      description: 'Disabled radio button'
    }
  ]
};

/**
 * Get all atom test suites
 */
export function getAllAtomTestSuites(): AtomTestSuite[] {
  return [
    BUTTON_TEST_SUITE,
    INPUT_TEST_SUITE,
    CHECKBOX_TEST_SUITE,
    CHIP_TEST_SUITE,
    BADGE_TEST_SUITE,
    SELECT_TEST_SUITE,
    SWITCH_TEST_SUITE,
    RADIO_TEST_SUITE
  ];
}

/**
 * Get test suite by component name
 */
export function getAtomTestSuite(componentName: string): AtomTestSuite | null {
  const testSuites = {
    'Button': BUTTON_TEST_SUITE,
    'Input': INPUT_TEST_SUITE,
    'Checkbox': CHECKBOX_TEST_SUITE,
    'Chip': CHIP_TEST_SUITE,
    'Badge': BADGE_TEST_SUITE,
    'Select': SELECT_TEST_SUITE,
    'Switch': SWITCH_TEST_SUITE,
    'Radio': RADIO_TEST_SUITE
  };

  return testSuites[componentName as keyof typeof testSuites] || null;
}

/**
 * Validate test suite completeness for a component
 */
export function validateTestSuiteCompleteness(testSuite: AtomTestSuite): {
  isComplete: boolean;
  missing: string[];
  suggestions: string[];
} {
  const missing: string[] = [];
  const suggestions: string[] = [];

  // Check for basic test coverage
  const hasDefaultTest = testSuite.testCases.some(test => Object.keys(test.props).length === 0);
  if (!hasDefaultTest) {
    missing.push('Default state test');
  }

  // Check for variant coverage (if component has variants)
  const variantTests = testSuite.testCases.filter(test => test.props.variant);
  if (variantTests.length === 0 && testSuite.component !== 'Input' && testSuite.component !== 'Select') {
    suggestions.push('Consider adding variant tests if component supports variants');
  }

  // Check for size coverage
  const sizeTests = testSuite.testCases.filter(test => test.props.size);
  if (sizeTests.length === 0) {
    suggestions.push('Consider adding size variation tests');
  }

  // Check for disabled state coverage
  const disabledTests = testSuite.testCases.filter(test => test.props.disabled);
  if (disabledTests.length === 0) {
    suggestions.push('Consider adding disabled state tests');
  }

  // Check for combination tests
  const combinationTests = testSuite.testCases.filter(test => Object.keys(test.props).length > 1);
  if (combinationTests.length === 0) {
    suggestions.push('Consider adding tests for prop combinations');
  }

  return {
    isComplete: missing.length === 0,
    missing,
    suggestions
  };
}
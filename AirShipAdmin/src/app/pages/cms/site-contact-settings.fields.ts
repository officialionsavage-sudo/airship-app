export type ContactSettingField = {
  key: string;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: 'tel' | 'email' | 'text';
  required?: boolean;
};

/** Client-facing contact fields; keys match AirShipApp resolveSiteContact(). */
export const CONTACT_SETTING_FIELDS: ContactSettingField[] = [
  {
    key: 'contact_phone',
    label: 'Phone number',
    type: 'tel',
    placeholder: '+20 114 484 1607',
    hint: 'Shown on the contact page and footer.',
    required: true,
  },
  {
    key: 'contact_whatsapp',
    label: 'WhatsApp number',
    type: 'tel',
    placeholder: '+20 114 484 1607',
    hint: 'Used for the floating WhatsApp button and booking links on tours, units, and offers.',
    required: true,
  },
  {
    key: 'contact_email',
    label: 'Email',
    type: 'email',
    placeholder: 'info@airship.com',
    hint: 'Contact form and footer.',
    required: true,
  },
  {
    key: 'contact_location',
    label: 'Address',
    type: 'text',
    placeholder: 'Hurghada, Red Sea, Egypt',
    hint: 'Office or business address shown to visitors.',
    required: true,
  },
  {
    key: 'contact_maps_query',
    label: 'Map search text (optional)',
    type: 'text',
    placeholder: 'Hurghada, Egypt',
    hint: 'Text used when opening Google Maps. Leave blank to use the address above.',
  },
  {
    key: 'contact_hours_line_1',
    label: 'Opening hours — line 1',
    type: 'text',
    placeholder: 'Monday - Friday: 9:00 AM - 6:00 PM',
    hint: 'First line of your opening hours.',
    required: true,
  },
  {
    key: 'contact_hours_line_2',
    label: 'Opening hours — line 2',
    type: 'text',
    placeholder: 'Saturday: 10:00 AM - 4:00 PM',
    hint: 'Second line (optional content; leave blank if not needed).',
  },
  {
    key: 'contact_hours_line_3',
    label: 'Opening hours — line 3',
    type: 'text',
    placeholder: 'Sunday: Closed',
    hint: 'Third line (optional content; leave blank if not needed).',
  },
];

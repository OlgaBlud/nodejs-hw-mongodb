import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/constants.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find({ userId });
  if (filter.type !== null) {
    contactsQuery.where('contactType').equals(filter.type);
  }
  if (filter.isFavourite !== null) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  // const contactsCount = await ContactsCollection.find()
  //   .merge(contactsQuery)
  //   .countDocuments();
  const [contactsCount, contacts] = await Promise.all([
    contactsQuery.clone().countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, page, perPage);
  return { data: contacts, ...paginationData };
};

export const getContactById = async (userId, contactId) => {
  const contact = await ContactsCollection.findOne({ userId, _id: contactId });
  return contact;
};
export const createContact = async (userData) => {
  const contact = await ContactsCollection.create(userData);

  return contact;
};
export const deleteContact = async (userId, contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    userId,
    _id: contactId,
  });
  return contact;
};

export const updateContact = async (
  userId,
  contactId,
  payload,
  options = {},
) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { userId, _id: contactId },
    payload,
    { new: true, includeResultMetadata: true, ...options },
  );
  if (!rawResult || !rawResult.value) return null;
  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

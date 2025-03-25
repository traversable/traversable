import { z } from "zod"

import $doc from "../__specs__/pet.hack.js"

/**
 * # {@link Order `Order`}
 * - Visit: {@link $doc.components.schemas.Order OpenAPI definition}
 */
export type Order = 
  z.infer<typeof Order>
export const Order = 
  z.object({
    /**
     * ## {@link Order.shape.id `Order.id`}
     * #### {@link $doc.components.schemas.Order.properties.id `Link to OpenAPI node`}
     */
    id: z.number().int().optional(),
    /**
     * ## {@link Order.shape.petId `Order.petId`}
     * #### {@link $doc.components.schemas.Order.properties.petId `Link to OpenAPI node`}
     */
    petId: z.number().int().optional(),
    /**
     * ## {@link Order.shape.quantity `Order.quantity`}
     * #### {@link $doc.components.schemas.Order.properties.quantity `Link to OpenAPI node`}
     */
    quantity: z.number().int().optional(),
    /**
     * ## {@link Order.shape.shipDate `Order.shipDate`}
     * #### {@link $doc.components.schemas.Order.properties.shipDate `Link to OpenAPI node`}
     */
    shipDate: z.string().optional(),
    /**
     * ## {@link Order.shape.status `Order.status`}
     * #### {@link $doc.components.schemas.Order.properties.status `Link to OpenAPI node`}
     */
    status: z.string().optional(),
    /**
     * ## {@link Order.shape.complete `Order.complete`}
     * #### {@link $doc.components.schemas.Order.properties.complete `Link to OpenAPI node`}
     */
    complete: z.boolean().optional()
  })

/**
 * # {@link Address `Address`}
 * - Visit: {@link $doc.components.schemas.Address OpenAPI definition}
 */
export type Address = 
  z.infer<typeof Address>
export const Address = 
  z.object({
    /**
     * ## {@link Address.shape.street `Address.street`}
     * #### {@link $doc.components.schemas.Address.properties.street `Link to OpenAPI node`}
     */
    street: z.string().optional(),
    /**
     * ## {@link Address.shape.city `Address.city`}
     * #### {@link $doc.components.schemas.Address.properties.city `Link to OpenAPI node`}
     */
    city: z.string().optional(),
    /**
     * ## {@link Address.shape.state `Address.state`}
     * #### {@link $doc.components.schemas.Address.properties.state `Link to OpenAPI node`}
     */
    state: z.string().optional(),
    /**
     * ## {@link Address.shape.zip `Address.zip`}
     * #### {@link $doc.components.schemas.Address.properties.zip `Link to OpenAPI node`}
     */
    zip: z.string().optional()
  })

/**
 * # {@link Category `Category`}
 * - Visit: {@link $doc.components.schemas.Category OpenAPI definition}
 */
export type Category = 
  z.infer<typeof Category>
export const Category = 
  z.object({
    /**
     * ## {@link Category.shape.id `Category.id`}
     * #### {@link $doc.components.schemas.Category.properties.id `Link to OpenAPI node`}
     */
    id: z.number().int().optional(),
    /**
     * ## {@link Category.shape.name `Category.name`}
     * #### {@link $doc.components.schemas.Category.properties.name `Link to OpenAPI node`}
     */
    name: z.string().optional()
  })

/**
 * # {@link User `User`}
 * - Visit: {@link $doc.components.schemas.User OpenAPI definition}
 */
export type User = 
  z.infer<typeof User>
export const User = 
  z.object({
    /**
     * ## {@link User.shape.id `User.id`}
     * #### {@link $doc.components.schemas.User.properties.id `Link to OpenAPI node`}
     */
    id: z.number().int().optional(),
    /**
     * ## {@link User.shape.username `User.username`}
     * #### {@link $doc.components.schemas.User.properties.username `Link to OpenAPI node`}
     */
    username: z.string().optional(),
    /**
     * ## {@link User.shape.firstName `User.firstName`}
     * #### {@link $doc.components.schemas.User.properties.firstName `Link to OpenAPI node`}
     */
    firstName: z.string().optional(),
    /**
     * ## {@link User.shape.lastName `User.lastName`}
     * #### {@link $doc.components.schemas.User.properties.lastName `Link to OpenAPI node`}
     */
    lastName: z.string().optional(),
    /**
     * ## {@link User.shape.email `User.email`}
     * #### {@link $doc.components.schemas.User.properties.email `Link to OpenAPI node`}
     */
    email: z.string().optional(),
    /**
     * ## {@link User.shape.password `User.password`}
     * #### {@link $doc.components.schemas.User.properties.password `Link to OpenAPI node`}
     */
    password: z.string().optional(),
    /**
     * ## {@link User.shape.phone `User.phone`}
     * #### {@link $doc.components.schemas.User.properties.phone `Link to OpenAPI node`}
     */
    phone: z.string().optional(),
    /**
     * ## {@link User.shape.userStatus `User.userStatus`}
     * #### {@link $doc.components.schemas.User.properties.userStatus `Link to OpenAPI node`}
     */
    userStatus: z.number().int().optional()
  })

/**
 * # {@link Tag `Tag`}
 * - Visit: {@link $doc.components.schemas.Tag OpenAPI definition}
 */
export type Tag = 
  z.infer<typeof Tag>
export const Tag = 
  z.object({
    /**
     * ## {@link Tag.shape.id `Tag.id`}
     * #### {@link $doc.components.schemas.Tag.properties.id `Link to OpenAPI node`}
     */
    id: z.number().int().optional(),
    /**
     * ## {@link Tag.shape.name `Tag.name`}
     * #### {@link $doc.components.schemas.Tag.properties.name `Link to OpenAPI node`}
     */
    name: z.string().optional()
  })

/**
 * # {@link ApiResponse `ApiResponse`}
 * - Visit: {@link $doc.components.schemas.ApiResponse OpenAPI definition}
 */
export type ApiResponse = 
  z.infer<typeof ApiResponse>
export const ApiResponse = 
  z.object({
    /**
     * ## {@link ApiResponse.shape.code `ApiResponse.code`}
     * #### {@link $doc.components.schemas.ApiResponse.properties.code `Link to OpenAPI node`}
     */
    code: z.number().int().optional(),
    /**
     * ## {@link ApiResponse.shape.type `ApiResponse.type`}
     * #### {@link $doc.components.schemas.ApiResponse.properties.type `Link to OpenAPI node`}
     */
    type: z.string().optional(),
    /**
     * ## {@link ApiResponse.shape.message `ApiResponse.message`}
     * #### {@link $doc.components.schemas.ApiResponse.properties.message `Link to OpenAPI node`}
     */
    message: z.string().optional()
  })

/**
 * # {@link Customer `Customer`}
 * - Visit: {@link $doc.components.schemas.Customer OpenAPI definition}
 */
export type Customer = 
  z.infer<typeof Customer>
export const Customer = 
  z.object({
    /**
     * ## {@link Customer.shape.id `Customer.id`}
     * #### {@link $doc.components.schemas.Customer.properties.id `Link to OpenAPI node`}
     */
    id: z.number().int().optional(),
    /**
     * ## {@link Customer.shape.username `Customer.username`}
     * #### {@link $doc.components.schemas.Customer.properties.username `Link to OpenAPI node`}
     */
    username: z.string().optional(),
    /**
     * ## {@link Customer.shape.address `Customer.address`}
     * #### {@link $doc.components.schemas.Customer.properties.address `Link to OpenAPI node`}
     */
    address: z.array(
      Address
    ).optional()
  })

/**
 * # {@link Pet `Pet`}
 * - Visit: {@link $doc.components.schemas.Pet OpenAPI definition}
 */
export type Pet = 
  z.infer<typeof Pet>
export const Pet = 
  z.object({
    /**
     * ## {@link Pet.shape.id `Pet.id`}
     * #### {@link $doc.components.schemas.Pet.properties.id `Link to OpenAPI node`}
     */
    id: z.number().int().optional(),
    /**
     * ## {@link Pet.shape.name `Pet.name`}
     * #### {@link $doc.components.schemas.Pet.properties.name `Link to OpenAPI node`}
     */
    name: z.string(),
    /**
     * ## {@link Pet.shape.category `Pet.category`}
     * #### {@link $doc.components.schemas.Pet.properties.category `Link to OpenAPI node`}
     */
    category: Category.optional(),
    /**
     * ## {@link Pet.shape.photoUrls `Pet.photoUrls`}
     * #### {@link $doc.components.schemas.Pet.properties.photoUrls `Link to OpenAPI node`}
     */
    photoUrls: z.array(
      z.string()
    ),
    /**
     * ## {@link Pet.shape.tags `Pet.tags`}
     * #### {@link $doc.components.schemas.Pet.properties.tags `Link to OpenAPI node`}
     */
    tags: z.array(
      Tag
    ).optional(),
    /**
     * ## {@link Pet.shape.status `Pet.status`}
     * #### {@link $doc.components.schemas.Pet.properties.status `Link to OpenAPI node`}
     */
    status: z.string().optional()
  })

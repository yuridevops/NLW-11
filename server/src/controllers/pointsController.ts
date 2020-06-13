import knex from '../database/connection'
import { Request, Response } from 'express'

class PointsController {
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body

        const point = { 
            image: 'image-fake',
            name: name,
            email: email,
            whatsapp: whatsapp,
            latitude: latitude,
            longitude: longitude,
            city: city,
            uf: uf
        }

        const trx = await knex.transaction()

        const insertedIds = await trx('points').insert(point)

        const point_id = insertedIds[0]


        const pointItems = items.map((item_id: number) => {
            return {
                point_id,
                item_id
            }
        })

        await trx('point_items').insert(pointItems)

        trx.commit()
        
        return response.json({...point, id: point_id})
    }
    
    async show(request: Request, response: Response){
        const { id } = request.params 
        const point = await knex('points').where('id',id).first()

        if(!point){
            return response.status(400).json({ message : 'Point not found'})
        } 

        const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id',id)
        .select('items.title')
        return response.json({point, items})
    }

    async index(request: Request, response: Response){
        const { city, uf, items } = request.query

        const parsedItems = String(items).trim().split(',').map( item => Number(item))

        const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*')

        return response.json(points)
    }

}

export default PointsController
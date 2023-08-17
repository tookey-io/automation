import { generateMetadata } from './generate-metadata'
import { insertMetadata } from './insert-metadata'

const main = async () => {
    console.log('update pieces metadata: started')

    const filter = process.argv.slice(2)

    const piecesMetadata = await generateMetadata(filter.length > 0 ? filter : undefined)
    console.log(piecesMetadata.map(p => p.name))
    await insertMetadata(piecesMetadata)

    console.log('update pieces metadata: completed')
    process.exit()
}

main()

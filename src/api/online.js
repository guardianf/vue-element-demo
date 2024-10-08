import request from '../utils/request'

export const getProjects = () => {
  return request({
    url: '/file/projects',
    method: 'get'
  })
}

export const uploadThumbnail = (params) => {
  const { id, file } = params
  const form = new FormData()
  form.append('file', file)
  return request({
    url: `/file/project/${id}/uploadimage`,
    method: 'post',
    data: form
  })
}

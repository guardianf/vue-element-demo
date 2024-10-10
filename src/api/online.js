import request from '../utils/request_file'
/**
 * 获取项目
 * @returns Promise
 */
export const getProjects = () => {
  return request({
    url: '/project/list',
    method: 'get'
  })
}

/**
 * 更新项目缩略图
 * @param {Object} params 参数
 * @param.id {Int} 项目ID
 * @param.file {File} 缩略图文件
 * @returns Promise
 */
export const uploadThumbnail = (params) => {
  const { id, file } = params
  const form = new FormData()
  form.append('file', file)
  return request({
    url: `/project/${id}/uploadimage`,
    method: 'post',
    data: form
  })
}

export const deleteProject = id => {
  return request({
    url: `/project/${id}`,
    method: 'delete'
  })
}

export const getProjectFileConstruction = id => {
  return request({
    url: `/constructions/${id}`,
    method: 'get'
  })
}

export const updateProjectFileConstruction = (id, data) => {
  return request({
    url: `/constructions/${id}`,
    method: 'post',
    data
  })
}

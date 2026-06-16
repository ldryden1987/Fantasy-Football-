import { useState, useRef } from "react";
import api from '../services/api'


const TeamAvatar = ({ team, size = 'md', editable = false, onUpdate }) => {
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef()

    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-lg',
        lg: 'w-16 h-16 text-2xl',
        xl: 'w-24 h-24 text-4xl'
    }

    const getInitials = (name) => {
        if (!name) return '?'
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    }
    const getColor = (name) => {
        const colors = [
            'bg-red-500' , 'bg-blue-500','bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'
        ]
        if (!name) return colors[0]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }
    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('avatar', file)
            const res = await api.post(`/avatar/team/${team._id}`, formData, {
                headers: { 'Content-Type' : 'multipart/form-data' }
            })
            if (onUpdate) onUpdate(res.data.avatarUrl)
        } catch (err) {
            console.error('Upload error:', err)
        } finally {
            setUploading(false)
        }
    }

    return (
          <div className="relative inline-block">
      {team?.avatar ? (
        <img
          src={`http://localhost:8080${team.avatar}`}
          alt={team.name}
          className={`${sizes[size]} rounded-full object-cover border-2 border-gray-600`}
        />
      ) : (
        <div className={`${sizes[size]} ${getColor(team?.name)} rounded-full flex items-center justify-center font-bold text-white border-2 border-gray-600`}>
          {uploading ? '...' : getInitials(team?.name)}
        </div>
      )}

      {editable && (
        <>
          <button
            onClick={() => fileRef.current.click()}
            className="absolute -bottom-1 -right-1 bg-green-500 hover:bg-green-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
          >
            +
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}

export default TeamAvatar